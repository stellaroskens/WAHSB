import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { describe, it } from "node:test"
import { resolveSignupRoles } from "../netlify/functions/_shared/signupRoles.ts"
import {
  LOGIN_FAILED,
  LOGIN_RATE_LIMITED,
  STAFF_ACCESS_NOT_APPROVED,
  STAFF_ACCESS_UNAVAILABLE,
  STAFF_SESSION_NOT_CONFIRMED,
  decidePostLogin,
  guardReasonMessage,
  loginErrorMessage,
} from "../src/lib/auth/postLogin.ts"
import type { StaffSession } from "../src/lib/auth/session.ts"

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

function okSession(primaryRole: "super_admin" | "coach" | "team_administrator"): StaffSession {
  return { ok: true, id: "user-1", email: "staff@example.org", roles: [primaryRole], primaryRole, username: null }
}

class FakeAuthError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.status = status
  }
}

describe("successful staff login routing", () => {
  it("sends each server-confirmed role to its dashboard", () => {
    assert.deepEqual(decidePostLogin(okSession("super_admin")), { kind: "redirect", path: "/admin" })
    assert.deepEqual(decidePostLogin(okSession("coach")), { kind: "redirect", path: "/coach" })
    assert.deepEqual(decidePostLogin(okSession("team_administrator")), {
      kind: "redirect",
      path: "/team-administrator",
    })
  })
})

describe("server authorization failures after a correct password", () => {
  it("explains a missing role or allowlist rejection and signs the user out", () => {
    assert.deepEqual(decidePostLogin({ ok: false, reason: "forbidden" }), {
      kind: "blocked",
      message: STAFF_ACCESS_NOT_APPROVED,
      signOut: true,
    })
    assert.match(STAFF_ACCESS_NOT_APPROVED, /staff role may be missing/)
    assert.match(STAFF_ACCESS_NOT_APPROVED, /allowlist/)
  })

  it("signs out when the server cannot see the session cookie", () => {
    assert.deepEqual(decidePostLogin({ ok: false, reason: "unauthorized" }), {
      kind: "blocked",
      message: STAFF_SESSION_NOT_CONFIRMED,
      signOut: true,
    })
  })

  it("keeps the session when the check is temporarily unavailable", () => {
    assert.deepEqual(decidePostLogin({ ok: false, reason: "unavailable" }), {
      kind: "blocked",
      message: STAFF_ACCESS_UNAVAILABLE,
      signOut: false,
    })
  })

  it("explains why a dashboard guard sent the user back", () => {
    assert.equal(guardReasonMessage("forbidden"), STAFF_ACCESS_NOT_APPROVED)
    assert.equal(guardReasonMessage("unauthorized"), STAFF_SESSION_NOT_CONFIRMED)
    assert.equal(guardReasonMessage("unavailable"), STAFF_ACCESS_UNAVAILABLE)
    assert.equal(guardReasonMessage(undefined), null)
    assert.equal(guardReasonMessage("anything-else"), null)
  })
})

describe("failed login messages", () => {
  it("never repeats provider text that could reveal whether an email exists", () => {
    const providerText = "No user found with that email, or password invalid."
    assert.equal(loginErrorMessage(new FakeAuthError(providerText, 400)), LOGIN_FAILED)
    assert.equal(loginErrorMessage(new FakeAuthError("Email not confirmed", 401)), LOGIN_FAILED)
    assert.equal(loginErrorMessage(new TypeError("Failed to fetch")), LOGIN_FAILED)
    assert.equal(loginErrorMessage(null), LOGIN_FAILED)
    assert.doesNotMatch(LOGIN_FAILED, /no user|not found|exists/i)
  })

  it("explains rate limits plainly", () => {
    assert.equal(loginErrorMessage(new FakeAuthError("Rate limit exceeded", 429)), LOGIN_RATE_LIMITED)
    assert.equal(loginErrorMessage(new FakeAuthError("Rate limit exceeded, try again later")), LOGIN_RATE_LIMITED)
  })
})

describe("login pages use the server session, not browser roles", () => {
  const hook = read("src/lib/auth/useStaffAccessCheck.ts")
  const staffLogin = read("src/pages/staff/StaffLogin.tsx")
  const panel = read("src/pages/signIn/StaffSignInPanel.tsx")

  it("decides the destination from /api/staff/session", () => {
    assert.match(hook, /decidePostLogin\(await fetchStaffSession\(\)\)/)
    assert.match(hook, /navigate\(decision\.path, \{ replace: true \}\)/)
    assert.doesNotMatch(hook, /rolesFromUser|localStorage/)
  })

  it("is used by /staff/login and the /sign-in staff panel", () => {
    for (const source of [staffLogin, panel]) {
      assert.match(source, /useStaffAccessCheck\(/)
      assert.match(source, /loginErrorMessage\(err\)/)
      assert.doesNotMatch(source, /window\.location\.assign/)
      assert.doesNotMatch(source, /primaryStaffRole\(rolesFromUser|staffHomePath\(rolesFromUser/)
      assert.doesNotMatch(source, /setEmail\(""\)/)
      assert.doesNotMatch(source, /console\.(log|info|debug)/)
    }
  })

  it("shows guard refusals instead of bouncing back to /admin", () => {
    assert.match(staffLogin, /guardReasonMessage\(/)
    assert.match(staffLogin, /useStaffAccessCheck\(authUiEnabled && !inCallback && !guardMessage\)/)
  })
})

describe("invite acceptance keeps trusted roles", () => {
  const allowlist = ["owner@example.org"]

  it("keeps an owner-assigned super_admin for an allowlisted email", () => {
    assert.deepEqual(
      resolveSignupRoles({ email: "Owner@Example.org ", incomingRoles: ["super_admin"], plannedRole: "", planned: undefined, allowlist }),
      ["super_admin"],
    )
  })

  it("strips super_admin when the email is not allowlisted or the allowlist is empty", () => {
    assert.deepEqual(
      resolveSignupRoles({ email: "other@example.org", incomingRoles: ["super_admin"], plannedRole: "", planned: undefined, allowlist }),
      [],
    )
    assert.deepEqual(
      resolveSignupRoles({ email: "owner@example.org", incomingRoles: ["super_admin"], plannedRole: "", planned: undefined, allowlist: [] }),
      [],
    )
  })

  it("still grants coach and team administrator roles only from the approved roster", () => {
    assert.deepEqual(
      resolveSignupRoles({ email: "a@example.org", incomingRoles: ["coach", "admin"], plannedRole: "", planned: undefined, allowlist }),
      [],
    )
    assert.deepEqual(
      resolveSignupRoles({
        email: "a@example.org",
        incomingRoles: [],
        plannedRole: "coach",
        planned: { username: "cmeredith", role: "coach" },
        allowlist,
      }),
      ["coach"],
    )
    assert.deepEqual(
      resolveSignupRoles({
        email: "a@example.org",
        incomingRoles: [],
        plannedRole: "super_admin",
        planned: { username: "cmeredith", role: "coach" },
        allowlist,
      }),
      [],
    )
  })

  it("keeps non-staff roles", () => {
    assert.deepEqual(
      resolveSignupRoles({ email: "a@example.org", incomingRoles: ["newsletter"], plannedRole: "", planned: undefined, allowlist }),
      ["newsletter"],
    )
  })

  it("applies this in the identity-signup hook, reading roles only from app_metadata", async () => {
    process.env.ADMIN_EMAIL_ALLOWLIST = "owner@example.org"
    const { handler } = await import("../netlify/functions/identity-signup.ts")
    const run = async (user: Record<string, unknown>) => {
      const result = (await handler({ body: JSON.stringify({ user }) } as never, {} as never, () => {})) as {
        body: string
      }
      return JSON.parse(result.body) as { app_metadata: { roles: string[] } }
    }

    const owner = await run({ email: "owner@example.org", app_metadata: { roles: ["super_admin"] }, user_metadata: {} })
    assert.deepEqual(owner.app_metadata.roles, ["super_admin"])

    const stranger = await run({ email: "x@example.org", app_metadata: { roles: ["super_admin"] }, user_metadata: {} })
    assert.deepEqual(stranger.app_metadata.roles, [])

    const selfClaim = await run({
      email: "owner@example.org",
      app_metadata: {},
      user_metadata: { roles: ["super_admin"], role: "super_admin", planned_role: "super_admin" },
    })
    assert.deepEqual(selfClaim.app_metadata.roles, [])
    delete process.env.ADMIN_EMAIL_ALLOWLIST
  })
})
