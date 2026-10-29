import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { describe, it } from "node:test"
import { staffHomePath } from "../src/lib/auth/roles.ts"
import {
  FAMILY_ACCESS_OPEN,
  FAMILY_ACCESS_PENDING_MESSAGE,
  FAMILY_DASHBOARD_PLANNED,
  FAMILY_INVITE_WORKFLOW,
} from "../src/lib/family/familyAccess.ts"

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

const app = read("src/App.tsx")
const signIn = read("src/pages/SignIn.tsx")
const staffPanel = read("src/pages/signIn/StaffSignInPanel.tsx")
const familyPanel = read("src/pages/signIn/FamilyAccessPanel.tsx")
const familyDashboard = read("src/pages/FamilyDashboard.tsx")
const familyAccess = read("src/lib/family/familyAccess.ts")
const headers = read("public/_headers")

describe("team and family sign-in page", () => {
  it("replaces the old placeholder on /sign-in", () => {
    assert.match(app, /<Route path="sign-in" element=\{<SignIn \/>\} \/>/)
    assert.equal(existsSync(new URL("../src/pages/SignInUnavailable.tsx", import.meta.url)), false)
    assert.doesNotMatch(signIn, /Coming later|not open yet/i)
  })

  it("uses the required title, subtitle, and two access options", () => {
    assert.match(signIn, /title="Team & Family Login"/)
    assert.match(
      signIn,
      /Secure access for approved coaches, team administrators, and Albany High School Bowling families\./,
    )
    assert.match(signIn, /Staff Login/)
    assert.match(signIn, /For approved coaches, team administrators, and website administrators\./)
    assert.match(signIn, /Family Login/)
    assert.match(signIn, /For verified parents and guardians listed on the approved team roster\./)
  })

  it("reuses the existing Identity sign-in instead of a second login system", () => {
    assert.match(staffPanel, /useAuth\(\)/)
    assert.match(staffPanel, /login\(email, password\)/)
    assert.match(staffPanel, /<PasswordRecoveryForm\s+variant="public"/)
    assert.doesNotMatch(staffPanel, /from "@netlify\/identity"[^\n]*\b(login|signup)\b/)
    assert.doesNotMatch(staffPanel + signIn, /\bsignup\b|Create account|Register/i)
  })

  it("shows email, password, Sign In, Forgot Password, and invitation-only text", () => {
    assert.match(staffPanel, /type="email"/)
    assert.match(staffPanel, /type="password"/)
    assert.match(staffPanel, /"Sign In"/)
    assert.match(staffPanel, /Forgot Password/)
    assert.match(staffPanel, /invitation-only/)
  })

  it("never lets visitors pick a role or store auth data in the browser", () => {
    for (const source of [signIn, staffPanel, familyPanel, familyDashboard]) {
      assert.doesNotMatch(source, /<select|type="radio"|name="role"/)
      assert.doesNotMatch(source, /localStorage|sessionStorage/)
    }
  })

  it("routes by trusted roles read from the Identity user", () => {
    assert.match(staffPanel, /staffHomePath\(rolesFromUser\(user\)\)/)
  })

  it("keeps login and recovery errors generic to avoid revealing which emails exist", () => {
    assert.doesNotMatch(staffPanel, /setError\(\s*(err|error)\.message/)
    assert.match(staffPanel, /setError\(isRateLimitError\(err\) \? TOO_MANY_ATTEMPTS : LOGIN_FAILED\)/)
  })

  it("serves the sign-in and family pages uncached and unindexed", () => {
    assert.match(headers, /\/sign-in\n  Cache-Control: no-store\n  X-Robots-Tag: noindex, nofollow/)
    assert.match(headers, /\/family\n  Cache-Control: no-store\n  X-Robots-Tag: noindex, nofollow/)
  })
})

describe("staff routing after sign-in", () => {
  it("sends each staff role to its dashboard", () => {
    assert.equal(staffHomePath(["super_admin"]), "/admin")
    assert.equal(staffHomePath(["coach"]), "/coach")
    assert.equal(staffHomePath(["team_administrator"]), "/team-administrator")
  })

  it("prefers the highest role when several are assigned", () => {
    assert.equal(staffHomePath(["coach", "super_admin"]), "/admin")
    assert.equal(staffHomePath(["team_administrator", "coach"]), "/coach")
  })

  it("gives no dashboard to users without a staff role", () => {
    assert.equal(staffHomePath([]), null)
    assert.equal(staffHomePath(undefined), null)
    assert.equal(staffHomePath(["admin"]), null)
    assert.equal(staffHomePath(["guardian"]), null)
    assert.equal(staffHomePath("super_admin"), null)
  })
})

describe("family access before roster approval", () => {
  it("stays closed with the approved message", () => {
    assert.equal(FAMILY_ACCESS_OPEN, false)
    assert.equal(
      FAMILY_ACCESS_PENDING_MESSAGE,
      "Family accounts are being prepared. Invitations will be sent to approved roster email addresses when family access opens.",
    )
    assert.match(familyPanel, /FAMILY_ACCESS_PENDING_MESSAGE/)
  })

  it("has no working family sign-in form", () => {
    assert.doesNotMatch(familyPanel, /<form|<input|login\(|useAuth/)
    assert.doesNotMatch(familyDashboard, /<form|<input|login\(|useAuth/)
  })

  it("contains no email addresses or student records", () => {
    for (const source of [familyAccess, familyPanel, familyDashboard]) {
      assert.doesNotMatch(source, /[\w.+-]+@[\w-]+\.[\w.]+/)
      assert.doesNotMatch(source, /fetch\(|\/api\//)
    }
  })

  it("documents the ten-step invitation workflow and planned dashboard sections", () => {
    assert.equal(FAMILY_INVITE_WORKFLOW.length, 10)
    assert.deepEqual(
      FAMILY_DASHBOARD_PLANNED.map((item) => item.title),
      [
        "Family announcements",
        "Practice and tournament reminders",
        "Calendar links",
        "Approved team resources",
        "Household information",
        "Photo consent",
        "Contact preferences",
      ],
    )
  })

  it("adds no family or guardian role to the server gate", () => {
    const roles = read("src/lib/auth/roles.ts")
    assert.doesNotMatch(roles, /guardian|family/i)
    assert.doesNotMatch(read("netlify.toml"), /\/family/)
  })
})
