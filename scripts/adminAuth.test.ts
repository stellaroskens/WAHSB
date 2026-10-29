import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { describe, it } from "node:test"
import { ADMIN_SECTIONS } from "../src/lib/auth/adminSections.ts"
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

  it("keeps staff login UI gated off by default in netlify.toml", () => {
    const toml = readFileSync(new URL("../netlify.toml", import.meta.url), "utf8")
    assert.match(toml, /VITE_ADMIN_AUTH_ENABLED\s*=\s*"false"/)
    assert.match(toml, /Role\s*=\s*\["super_admin"\]/)
  })

  it("does not ship a duplicate AdminAuthContext design", () => {
    assert.equal(existsSync(new URL("../src/auth/AdminAuthContext.tsx", import.meta.url)), false)
    assert.equal(existsSync(new URL("../src/lib/adminAuth.ts", import.meta.url)), false)
    assert.equal(existsSync(new URL("../src/lib/auth/AuthProvider.tsx", import.meta.url)), true)
  })
})
