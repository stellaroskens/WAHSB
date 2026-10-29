import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { describe, it } from "node:test"
import { ADMIN_SECTIONS } from "../src/lib/auth/adminSections.ts"
import { parseAdminAuthUiFlag } from "../src/lib/auth/config.ts"
import {
  STAFF_PASSWORD_HELP,
  STAFF_PASSWORD_MIN_LENGTH,
  STAFF_PASSWORD_TOO_SHORT,
  validateStaffPassword,
} from "../src/lib/auth/passwordPolicy.ts"
import {
  isAuthorizedSuperAdmin,
  isSuperAdmin,
  normalizeEmail,
  normalizeRoles,
  parseEmailAllowlist,
  SUPER_ADMIN_ROLE,
} from "../src/lib/auth/roles.ts"

describe("staff password policy", () => {
  it("keeps a 12-character minimum without requiring special symbols", () => {
    assert.equal(STAFF_PASSWORD_MIN_LENGTH, 12)
    assert.match(STAFF_PASSWORD_HELP, /Letters and numbers are enough/i)
    assert.match(STAFF_PASSWORD_HELP, /optional/i)
    assert.deepEqual(validateStaffPassword("short"), { ok: false, error: STAFF_PASSWORD_TOO_SHORT })
    assert.deepEqual(validateStaffPassword("elevenchars"), { ok: false, error: STAFF_PASSWORD_TOO_SHORT })
    assert.deepEqual(validateStaffPassword("twelvechars1"), { ok: true })
    assert.deepEqual(validateStaffPassword("AlbanyBowling"), { ok: true })
    assert.deepEqual(validateStaffPassword("lettersnums1"), { ok: true })
    assert.deepEqual(validateStaffPassword("WithSymbols!1"), { ok: true })
  })

  it("wires the shared policy into staff login forms", () => {
    const login = readFileSync(new URL("../src/pages/staff/StaffLogin.tsx", import.meta.url), "utf8")
    assert.match(login, /validateStaffPassword/)
    assert.match(login, /STAFF_PASSWORD_HELP/)
    assert.match(login, /STAFF_PASSWORD_MIN_LENGTH/)
    assert.equal(/password\.length\s*<\s*12/.test(login), false)
    assert.equal(/require[sd]?\s+special|special symbols? (are )?required|must include.*(symbol|punctuation)/i.test(login), false)
  })
})

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

  it("does not ship a duplicate AdminAuthContext design", () => {
    assert.equal(existsSync(new URL("../src/auth/AdminAuthContext.tsx", import.meta.url)), false)
    assert.equal(existsSync(new URL("../src/lib/adminAuth.ts", import.meta.url)), false)
    assert.equal(existsSync(new URL("../src/lib/auth/AuthProvider.tsx", import.meta.url)), true)
  })
})
