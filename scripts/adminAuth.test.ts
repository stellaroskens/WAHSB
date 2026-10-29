import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { describe, it } from "node:test"
import { ADMIN_SECTIONS } from "../src/lib/auth/adminSections.ts"
import { parseAdminAuthUiFlag } from "../src/lib/auth/config.ts"
import {
  isAuthorizedSuperAdmin,
  isSuperAdmin,
  normalizeEmail,
  normalizeRoles,
  parseEmailAllowlist,
  SUPER_ADMIN_ROLE,
} from "../src/lib/auth/roles.ts"

describe("admin role helpers", () => {
  it("recognizes only super_admin as privileged for Phase 1 dashboards", () => {
    assert.equal(SUPER_ADMIN_ROLE, "super_admin")
    assert.equal(isSuperAdmin(["super_admin"]), true)
    assert.equal(isSuperAdmin(["admin"]), false)
    assert.equal(isSuperAdmin([]), false)
    assert.deepEqual(normalizeRoles(["super_admin", 1, null, ""]), ["super_admin"])
  })

  it("requires role plus allowlist and never trusts email alone", () => {
    const allowlist = parseEmailAllowlist("stellaroskens@gmail.com, other@example.com")
    assert.deepEqual(allowlist, ["stellaroskens@gmail.com", "other@example.com"])
    assert.equal(normalizeEmail("  StellaRoskens@Gmail.com "), "stellaroskens@gmail.com")

    assert.equal(
      isAuthorizedSuperAdmin({
        roles: ["super_admin"],
        email: "stellaroskens@gmail.com",
        allowlist,
        requireAllowlist: true,
      }),
      true,
    )
    assert.equal(
      isAuthorizedSuperAdmin({
        roles: [],
        email: "stellaroskens@gmail.com",
        allowlist,
        requireAllowlist: true,
      }),
      false,
    )
    assert.equal(
      isAuthorizedSuperAdmin({
        roles: ["super_admin"],
        email: "intruder@example.com",
        allowlist,
        requireAllowlist: true,
      }),
      false,
    )
    assert.equal(
      isAuthorizedSuperAdmin({
        roles: ["super_admin"],
        email: "stellaroskens@gmail.com",
        allowlist: [],
        requireAllowlist: true,
      }),
      false,
    )
  })
})

describe("admin dashboard foundation", () => {
  it("lists the required admin sections with Staff Accounts available", () => {
    const titles = ADMIN_SECTIONS.map((section) => section.title)
    assert.deepEqual(titles, [
      "Website Pages",
      "Tournament Management",
      "Coaches",
      "Volunteers",
      "Fundraisers",
      "Payment Settings",
      "Email Announcements",
      "Staff Accounts",
      "Media Library",
      "Publishing History",
      "Site Settings",
    ])
    const available = new Set(
      ADMIN_SECTIONS.filter((section) => section.status === "available").map((section) => section.id),
    )
    assert.ok(available.has("staff-accounts"))
    assert.ok(available.has("website-pages"))
    assert.ok(available.has("payment-settings"))
    assert.ok(available.has("email-announcements"))
    assert.ok(available.has("tournament-management"))
  })
})

describe("auth source safety", () => {
  it("does not hardcode passwords, PINs, or localStorage auth proof", () => {
    const files = [
      "src/pages/staff/StaffLogin.tsx",
      "src/lib/auth/AuthProvider.tsx",
      "src/lib/auth/session.ts",
      "src/lib/auth/RequireSuperAdmin.tsx",
      "netlify/functions/admin-session.ts",
      "netlify/functions/staff-session.ts",
      "netlify/functions/identity-signup.ts",
      "netlify/functions/identity-validate.ts",
      "netlify.toml",
    ]
    for (const file of files) {
      assert.equal(existsSync(new URL(`../${file}`, import.meta.url)), true, `${file} must exist`)
      const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8")
      assert.equal(/password\s*[:=]\s*["'][^"']+["']/i.test(source), false, `${file} must not hardcode passwords`)
      assert.equal(/\b(passcode|pin)\s*[:=]\s*["']?\d+/i.test(source), false, `${file} must not use PIN auth`)
      assert.equal(
        /localStorage\.setItem\(\s*["']auth/i.test(source),
        false,
        `${file} must not store auth proof in localStorage`,
      )
    }
  })

  it("keeps staff login UI gated off unless the flag is exactly true", () => {
    assert.equal(parseAdminAuthUiFlag(undefined), false)
    assert.equal(parseAdminAuthUiFlag(""), false)
    assert.equal(parseAdminAuthUiFlag("false"), false)
    assert.equal(parseAdminAuthUiFlag("True"), false)
    assert.equal(parseAdminAuthUiFlag(" true"), false)
    assert.equal(parseAdminAuthUiFlag("true"), true)
  })

  it("does not hardcode VITE_ADMIN_AUTH_ENABLED in netlify.toml (UI must control it)", () => {
    const toml = readFileSync(new URL("../netlify.toml", import.meta.url), "utf8")
    assert.equal(
      /^\s*VITE_ADMIN_AUTH_ENABLED\s*=/m.test(toml),
      false,
      "netlify.toml must not assign VITE_ADMIN_AUTH_ENABLED — it overrides Netlify UI env vars",
    )
    assert.equal(
      /^\s*ADMIN_AUTH_ENABLED\s*=/m.test(toml),
      false,
      "netlify.toml must not assign ADMIN_AUTH_ENABLED",
    )
    assert.match(toml, /Role\s*=\s*\["super_admin"\]/)
  })

  it("server auth helpers still require ADMIN_AUTH_ENABLED exact true and super_admin", () => {
    const requireAuth = readFileSync(new URL("../netlify/functions/_shared/requireAuth.ts", import.meta.url), "utf8")
    assert.match(requireAuth, /ADMIN_AUTH_ENABLED"\)\s*===\s*"true"/)
    assert.match(requireAuth, /export async function requireSuperAdmin/)
    assert.match(requireAuth, /super_admin role required/)
    const adminSession = readFileSync(new URL("../netlify/functions/admin-session.ts", import.meta.url), "utf8")
    assert.match(adminSession, /requireSuperAdmin/)
  })

  it("ships a public privacy route and footer link", () => {
    const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8")
    const footer = readFileSync(new URL("../src/components/Footer.tsx", import.meta.url), "utf8")
    const privacy = readFileSync(new URL("../src/pages/Privacy.tsx", import.meta.url), "utf8")
    assert.match(app, /path="privacy"\s+element=\{<Privacy\s*\/>\}/)
    assert.match(footer, /to="\/privacy"/)
    assert.match(privacy, /Privacy/)
  })

  it("does not ship a duplicate AdminAuthContext design", () => {
    assert.equal(existsSync(new URL("../src/auth/AdminAuthContext.tsx", import.meta.url)), false)
    assert.equal(existsSync(new URL("../src/lib/adminAuth.ts", import.meta.url)), false)
    assert.equal(existsSync(new URL("../src/lib/auth/AuthProvider.tsx", import.meta.url)), true)
  })
})
