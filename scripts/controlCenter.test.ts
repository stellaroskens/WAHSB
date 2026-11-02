import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { describe, it } from "node:test"
import { systemStatusReport } from "../src/lib/admin/systemStatus.ts"
import { ADMIN_SECTIONS } from "../src/lib/auth/adminSections.ts"
import { hasPermission, mayEditSiteDrafts, permissionsForRoles } from "../src/lib/auth/permissions.ts"
import { roleMayAccessPath } from "../src/lib/auth/permissions.ts"
import { COACH_ROLE, SUPER_ADMIN_ROLE, TEAM_ADMINISTRATOR_ROLE } from "../src/lib/auth/roles.ts"
import { editField, reviewContentChanges } from "../src/lib/content/pageEditor.ts"
import { parseSiteContent } from "../src/lib/content/siteContent.ts"

const published = parseSiteContent(JSON.parse(readFileSync(new URL("../src/content/published/siteContent.json", import.meta.url), "utf8")))

describe("super administrator permission coverage", () => {
  it("includes every coach and Club Administrator permission without those extra roles", () => {
    const superOnly = permissionsForRoles([SUPER_ADMIN_ROLE])
    for (const permission of permissionsForRoles([COACH_ROLE])) {
      assert.equal(superOnly.includes(permission), true, permission)
    }
    for (const permission of permissionsForRoles([TEAM_ADMINISTRATOR_ROLE])) {
      assert.equal(superOnly.includes(permission), true, permission)
    }
    assert.equal(hasPermission([SUPER_ADMIN_ROLE], "approve_publishing"), true)
    assert.equal(hasPermission([SUPER_ADMIN_ROLE], "manage_payments"), true)
    assert.equal(hasPermission([COACH_ROLE], "manage_payments"), false)
    assert.equal(hasPermission([COACH_ROLE], "manage_staff_invites"), false)
    assert.equal(hasPermission([TEAM_ADMINISTRATOR_ROLE], "approve_publishing"), false)
    assert.equal(hasPermission([TEAM_ADMINISTRATOR_ROLE], "manage_payouts"), false)
    assert.equal(hasPermission([TEAM_ADMINISTRATOR_ROLE], "prepare_connections"), true)
    assert.equal(mayEditSiteDrafts([SUPER_ADMIN_ROLE]), true)
    assert.equal(mayEditSiteDrafts([COACH_ROLE]), true)
    assert.equal(mayEditSiteDrafts([TEAM_ADMINISTRATOR_ROLE]), true)
    assert.equal(mayEditSiteDrafts([]), false)
  })

  it("lets super_admin open coach and Club Administrator routes", () => {
    assert.equal(roleMayAccessPath(SUPER_ADMIN_ROLE, "/coach"), true)
    assert.equal(roleMayAccessPath(SUPER_ADMIN_ROLE, "/coach/bowlers"), true)
    assert.equal(roleMayAccessPath(SUPER_ADMIN_ROLE, "/team-administrator"), true)
    assert.equal(roleMayAccessPath(SUPER_ADMIN_ROLE, "/team-administrator/bowlers"), true)
    assert.equal(roleMayAccessPath(SUPER_ADMIN_ROLE, "/admin/connections"), true)
    assert.equal(roleMayAccessPath(COACH_ROLE, "/admin/connections"), false)
    assert.equal(roleMayAccessPath(TEAM_ADMINISTRATOR_ROLE, "/admin"), false)
  })
})

describe("control center sections", () => {
  it("opens a real screen for every management area", () => {
    assert.equal(ADMIN_SECTIONS.length, 20)
    assert.equal(ADMIN_SECTIONS.every((section) => section.status === "available" && section.href.startsWith("/admin")), true)
    const coaches = readFileSync(new URL("../src/pages/admin/AdminRoleAccess.tsx", import.meta.url), "utf8")
    assert.match(coaches, /View Coach Dashboard/)
    assert.match(coaches, /Manage Coach Settings/)
    assert.match(coaches, /View Club Administrator Dashboard/)
    assert.match(coaches, /Manage Club Administrator Settings/)
    assert.match(coaches, /\/admin\/staff/)
    assert.match(coaches, /Return to Main Admin Dashboard/)
    const family = readFileSync(new URL("../src/pages/admin/AdminFamily.tsx", import.meta.url), "utf8")
    assert.equal(family.includes("<input"), false)
    assert.equal(family.includes("FAMILY_ACCESS_OPEN = true"), false)
    const consent = readFileSync(new URL("../src/pages/admin/AdminConsent.tsx", import.meta.url), "utf8")
    assert.equal(consent.includes("<input"), false)
    assert.equal(consent.includes("putFileContent"), false)
  })
})

describe("editor review", () => {
  it("lists a changed field without treating the review as a save", () => {
    const next = editField(published, "pageBodies.home.hero.heading", "Practice headline")
    const changes = reviewContentChanges(next, published)
    assert.equal(changes.some((change) => change.after === "Practice headline"), true)
    assert.equal(published.pageBodies.home.hero.heading === "Practice headline", false)
  })
})

describe("system status report", () => {
  it("describes missing setup without secrets or live-payment bypass", () => {
    const report = systemStatusReport({
      githubContentTokenConfigured: false,
      adminAuthEnabled: true,
      consentDatabaseConfigured: false,
      emailStatus: "disabled",
      emailLive: false,
      payments: [
        { id: "stripe", label: "Stripe", status: "disabled", liveEnabled: false },
        { id: "paypal", label: "PayPal", status: "disabled", liveEnabled: false },
        { id: "venmo", label: "Venmo", status: "disabled", liveEnabled: false },
        { id: "cash_app", label: "Cash App", status: "disabled", liveEnabled: false },
      ],
      familyAccessOpen: false,
    })
    const serialized = JSON.stringify(report)
    assert.equal(report.githubPublishing.configured, false)
    assert.equal(report.email.sending, false)
    assert.equal(report.privateDatabase.wired, false)
    assert.equal(report.mediaStorage.configured, false)
    assert.equal(report.familyAccess.open, false)
    assert.equal(report.guardianConsent.ready, false)
    assert.equal(report.netlifyDeploy.available, false)
    assert.equal(serialized.includes("ghp_"), false)
    assert.equal(serialized.toLowerCase().includes("password"), false)
    assert.equal(serialized.toLowerCase().includes("api key"), false)
    const source = readFileSync(new URL("../netlify/functions/admin-system-status.ts", import.meta.url), "utf8")
    assert.match(source, /requireSuperAdmin/)
    assert.doesNotMatch(source, /token,/)
    const drafts = readFileSync(new URL("../netlify/functions/content-drafts.ts", import.meta.url), "utf8")
    assert.match(drafts, /mayEditSiteDrafts/)
    const connections = readFileSync(new URL("../netlify/functions/admin-connections.ts", import.meta.url), "utf8")
    assert.match(connections, /liveEnabled: item.liveEnabled === true && item.status === "verified"/)
    const publish = readFileSync(new URL("../netlify/functions/content-publish.ts", import.meta.url), "utf8")
    assert.match(publish, /requireSuperAdmin/)
    assert.match(publish, /approve_publishing/)
  })
})
