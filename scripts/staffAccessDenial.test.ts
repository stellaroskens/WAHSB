import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { describe, it } from "node:test"
import { parseEmailAllowlist as parseServerAllowlist } from "../netlify/functions/_shared/roles.ts"
import { decideStaffAccess } from "../netlify/functions/_shared/staffAccess.ts"
import { STAFF_ACCESS_NOT_APPROVED, STAFF_DENIAL_MESSAGES, decidePostLogin, guardReasonMessage } from "../src/lib/auth/postLogin.ts"
import { parseEmailAllowlist as parseClientAllowlist } from "../src/lib/auth/roles.ts"

const owner = "owner@example.org"
const allowlist = [owner]

describe("server staff access decision", () => {
  it("accepts an allowlisted super_admin, case-insensitively", () => {
    assert.deepEqual(decideStaffAccess({ roles: ["super_admin"], email: "Owner@Example.org", allowlist }), {
      ok: true,
      primaryRole: "super_admin",
    })
  })

  it("rejects an account with no staff role", () => {
    const decision = decideStaffAccess({ roles: [], email: owner, allowlist })
    assert.equal(decision.ok, false)
    assert.equal(!decision.ok && decision.code, "missing_staff_role")
  })

  it("reports, but never accepts, a misspelled role name", () => {
    for (const role of ["Super_Admin", "super admin", " super_admin", "super-admin", "COACH"]) {
      const decision = decideStaffAccess({ roles: [role], email: owner, allowlist })
      assert.equal(decision.ok, false, role)
      assert.equal(!decision.ok && decision.code, "role_name_mismatch", role)
    }
    const other = decideStaffAccess({ roles: ["admin"], email: owner, allowlist })
    assert.equal(!other.ok && other.code, "missing_staff_role")
  })

  it("rejects a super_admin whose email is not allowlisted", () => {
    const decision = decideStaffAccess({ roles: ["super_admin"], email: "someone@example.org", allowlist })
    assert.equal(!decision.ok && decision.code, "super_admin_not_allowlisted")
  })

  it("fails closed when the allowlist is not configured", () => {
    const decision = decideStaffAccess({ roles: ["super_admin"], email: owner, allowlist: [] })
    assert.equal(!decision.ok && decision.code, "allowlist_not_configured")
  })

  it("does not require coaches or team administrators to be allowlisted", () => {
    assert.deepEqual(decideStaffAccess({ roles: ["coach"], email: "c@example.org", allowlist: [] }), {
      ok: true,
      primaryRole: "coach",
    })
    assert.deepEqual(decideStaffAccess({ roles: ["team_administrator"], email: "t@example.org", allowlist }), {
      ok: true,
      primaryRole: "team_administrator",
    })
  })

  it("is what requireEnabledStaffAuth uses, and the code is returned in the 403", () => {
    const source = readFileSync(new URL("../netlify/functions/_shared/requireAuth.ts", import.meta.url), "utf8")
    assert.match(source, /decideStaffAccess\(\{ roles, email, allowlist: getAdminEmailAllowlist\(\) \}\)/)
    assert.match(source, /json\(403, \{ error: "forbidden", code: decision\.code/)
  })
})

describe("allowlist parsing", () => {
  for (const [label, parse] of [["server", parseServerAllowlist], ["client", parseClientAllowlist]] as const) {
    it(`${label}: tolerates quotes, spaces, semicolons, and case`, () => {
      assert.deepEqual(parse(owner), [owner])
      assert.deepEqual(parse(` "Owner@Example.org" `), [owner])
      assert.deepEqual(parse(`'${owner}'`), [owner])
      assert.deepEqual(parse(`${owner}; b@example.org`), [owner, "b@example.org"])
      assert.deepEqual(parse(`${owner}, b@example.org\n`), [owner, "b@example.org"])
      assert.deepEqual(parse(""), [])
      assert.deepEqual(parse(undefined), [])
    })
  }
})

describe("login page explains the exact rejection", () => {
  it("maps every server code to a specific message", () => {
    for (const code of ["missing_staff_role", "role_name_mismatch", "allowlist_not_configured", "super_admin_not_allowlisted"]) {
      const decision = decidePostLogin({ ok: false, reason: "forbidden", detail: code })
      assert.equal(decision.kind, "blocked")
      assert.equal(decision.kind === "blocked" && decision.message, STAFF_DENIAL_MESSAGES[code])
      assert.equal(guardReasonMessage("forbidden", code), STAFF_DENIAL_MESSAGES[code])
    }
  })

  it("falls back to the general message for unknown codes", () => {
    const decision = decidePostLogin({ ok: false, reason: "forbidden", detail: "something_new" })
    assert.equal(decision.kind === "blocked" && decision.message, STAFF_ACCESS_NOT_APPROVED)
  })
})
