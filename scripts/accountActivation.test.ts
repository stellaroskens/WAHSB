import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { describe, it } from "node:test"
import {
  ACCOUNT_ALREADY_ACTIVATED,
  ACTIVATION_BUTTON,
  ACTIVATION_CONFIRMATION,
  ACTIVATION_EMAIL_PANEL,
  ACTIVATION_EMAIL_PANEL_TITLE,
  ACTIVATION_INVALID_EMAIL,
  ACTIVATION_LIMITATION,
  ACTIVATION_RATE_LIMITED,
  ACTIVATION_STEPS,
  ACTIVATION_SUBTITLE,
  ACTIVATION_TITLE,
  ACTIVATION_UNAVAILABLE,
  AUTH_LINK_FAILED,
  FUTURE_SIGN_IN_OPTIONS,
  INVITE_EXPIRED,
  PASSWORD_SAVE_FAILED,
  VERIFICATION_INCOMPLETE,
  activationProblemFromError,
  activationPublicResult,
  displayNameUpdate,
  isPlausibleEmail,
  passwordSetupProblem,
} from "../src/lib/auth/activation.ts"
import { PLANNED_STAFF } from "../src/lib/auth/staffRoster.ts"
import { FAMILY_ACCESS_OPEN } from "../src/lib/family/familyAccess.ts"

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

describe("first-time activation copy", () => {
  it("uses the approved title, subtitle, button, and steps", () => {
    assert.equal(ACTIVATION_TITLE, "ACTIVATE YOUR ACCOUNT")
    assert.equal(ACTIVATION_SUBTITLE, "Getting started is easy. You only need your approved email address.")
    assert.equal(ACTIVATION_BUTTON, "CONTINUE WITH EMAIL")
    assert.deepEqual(
      ACTIVATION_STEPS.map((step) => step.title),
      [
        "Step 1 — Enter Your Email",
        "Step 2 — Check Your Inbox",
        "Step 3 — Verify Your Email",
        "Step 4 — Complete Your Profile",
        "Step 5 — Access Your Dashboard",
      ],
    )
    assert.match(ACTIVATION_STEPS[0].body, /approved by Albany High School Bowling/)
    assert.match(ACTIVATION_STEPS[1].body, /Netlify Identity/)
    assert.match(ACTIVATION_STEPS[3].body, /create your password/)
    assert.equal(ACTIVATION_EMAIL_PANEL_TITLE, "WHAT TO LOOK FOR IN YOUR EMAIL")
    assert.equal(ACTIVATION_EMAIL_PANEL.length, 3)
    assert.match(ACTIVATION_EMAIL_PANEL[0], /sender and subject may vary/)
    assert.match(ACTIVATION_EMAIL_PANEL[1], /Inbox, Spam, Junk, Promotions, and All Mail/)
    assert.match(ACTIVATION_EMAIL_PANEL[2], /approved Netlify or WAHSB website/)
    assert.doesNotMatch(ACTIVATION_EMAIL_PANEL.join(" "), /@/)
  })

  it("does not promise that the public page sends an invitation", () => {
    assert.match(ACTIVATION_LIMITATION, /cannot create one/)
    assert.match(ACTIVATION_CONFIRMATION, /did not send a new invitation/)
    assert.match(ACTIVATION_CONFIRMATION, /same for every address/)
    assert.doesNotMatch(ACTIVATION_CONFIRMATION, /@|we sent|invitation is on its way/i)
  })
})

describe("public activation responses", () => {
  it("returns one acknowledgement for every well-formed address", () => {
    const first = activationPublicResult("acknowledged")
    const second = activationPublicResult("acknowledged")
    assert.deepEqual(first, second)
    assert.equal(first.ok, true)
    assert.equal(first.message, ACTIVATION_CONFIRMATION)
    assert.equal(isPlausibleEmail("Coach@Example.com"), true)
    assert.equal(isPlausibleEmail("not-an-email"), false)
    assert.equal(isPlausibleEmail(""), false)
  })

  it("keeps invalid, rate-limit, and outage messages free of account details", () => {
    for (const code of ["invalid_email", "rate_limited", "unavailable"] as const) {
      const result = activationPublicResult(code)
      assert.equal(result.ok, false)
      assert.doesNotMatch(result.message, /exists|not found|roster/i)
    }
    assert.doesNotMatch(activationPublicResult("rate_limited").message, /@/)
    assert.doesNotMatch(activationPublicResult("unavailable").message, /@/)
    assert.equal(activationPublicResult("invalid_email").message, ACTIVATION_INVALID_EMAIL)
    assert.equal(activationPublicResult("rate_limited").message, ACTIVATION_RATE_LIMITED)
    assert.equal(activationPublicResult("unavailable").message, ACTIVATION_UNAVAILABLE)
  })

  it("explains invitation and password failures without echoing provider text", () => {
    assert.equal(
      activationProblemFromError({ status: 422, message: "Token has expired or is invalid" }),
      INVITE_EXPIRED,
    )
    assert.equal(
      activationProblemFromError({ status: 422, message: "Email address already registered by another user" }),
      ACCOUNT_ALREADY_ACTIVATED,
    )
    assert.equal(
      activationProblemFromError({ status: 400, message: "User not confirmed" }),
      VERIFICATION_INCOMPLETE,
    )
    assert.equal(activationProblemFromError({ status: 429, message: "Rate limit exceeded" }), ACTIVATION_RATE_LIMITED)
    assert.equal(activationProblemFromError(new TypeError("Failed to fetch")), ACTIVATION_UNAVAILABLE)
    assert.equal(activationProblemFromError({ status: 400, message: "weird provider detail user@secret.test" }), AUTH_LINK_FAILED)
    assert.doesNotMatch(AUTH_LINK_FAILED, /@/)
    assert.equal(passwordSetupProblem({ status: 422, message: "Password is too weak for the provider" }), PASSWORD_SAVE_FAILED)
    assert.doesNotMatch(PASSWORD_SAVE_FAILED, /too weak|secret/)
  })
})

describe("profile update cannot change access", () => {
  it("saves a display name and keeps the administrator-assigned username", () => {
    const update = displayNameUpdate(
      { userMetadata: { username: "cbreshears", planned_role: "coach", full_name: "Chris Breshears" } },
      "  Chris  ",
    )
    assert.deepEqual(update, { data: { full_name: "Chris", username: "cbreshears" } })
    assert.equal(Object.hasOwn(update?.data ?? {}, "role"), false)
    assert.equal(Object.hasOwn(update?.data ?? {}, "planned_role"), false)
    assert.equal(displayNameUpdate({ userMetadata: { username: "mfisher" } }, "   "), null)
  })

  it("keeps the planned staff usernames and does not open family access", () => {
    assert.deepEqual(
      PLANNED_STAFF.map((member) => ({ username: member.username, role: member.role })),
      [
        { username: "cmeredith", role: "coach" },
        { username: "cbreshears", role: "coach" },
        { username: "mfisher", role: "team_administrator" },
      ],
    )
    assert.equal(FAMILY_ACCESS_OPEN, false)
    assert.equal(FUTURE_SIGN_IN_OPTIONS.google.enabled, false)
    assert.equal(FUTURE_SIGN_IN_OPTIONS.passwordless.enabled, false)
  })
})

describe("activation stays invitation-only in source", () => {
  const activationFn = read("netlify/functions/staff-activation.ts")
  const adminInvite = read("netlify/functions/admin-staff-invite.ts")
  const signup = read("netlify/functions/identity-signup.ts")
  const section = read("src/pages/signIn/ActivateAccountSection.tsx")
  const guide = read("src/pages/signIn/ActivationGuide.tsx")
  const family = read("src/pages/signIn/FamilyAccessPanel.tsx")
  const signIn = read("src/pages/SignIn.tsx")
  const staffLogin = read("src/pages/staff/StaffLogin.tsx")
  const inviteSetup = read("src/pages/staff/StaffInviteSetup.tsx")
  const provider = read("src/lib/auth/AuthProvider.tsx")
  const redirect = read("src/components/AuthCallbackRedirect.tsx")

  it("does not let the public endpoint invite users or assign roles", () => {
    assert.doesNotMatch(activationFn, /\/invite\b|signup\(|fetch\(|app_metadata|roles\s*:/)
    assert.match(activationFn, /activationPublicResult\("acknowledged"\)/)
    assert.match(activationFn, /isAdminAuthEnabledServer/)
    assert.match(adminInvite, /requireSuperAdmin/)
    assert.match(adminInvite, /\/invite/)
    assert.match(signup, /resolveSignupRoles/)
  })

  it("shows email-only activation on /sign-in and keeps family requests closed", () => {
    assert.match(signIn, /<ActivateAccountSection \/>/)
    assert.match(section, /type="email"/)
    assert.match(section, /ACTIVATION_BUTTON/)
    assert.match(section, /<ActivationGuide \/>/)
    assert.doesNotMatch(section, /type="password"|oauthLogin|signup\(/)
    assert.match(guide, /ACTIVATION_STEPS/)
    assert.match(guide, /ACTIVATION_EMAIL_PANEL_TITLE/)
    assert.doesNotMatch(family, /<form|<input|requestActivationContinue|type="email"/)
    assert.match(family, /no family email is/)
    assert.match(family, /<ActivationGuide \/>/)
  })

  it("asks for a password only after the invitation link, and does not offer a role", () => {
    assert.match(inviteSetup, /type="password"/)
    assert.match(inviteSetup, /Confirm password/)
    assert.match(inviteSetup, /readOnly/)
    assert.match(inviteSetup, /Display name/)
    assert.doesNotMatch(inviteSetup, /type="radio"|<select|name="role"|updateUser/)
    assert.match(provider, /acceptInvite\(inviteToken, password\)/)
    assert.match(provider, /displayNameUpdate\(source, fullName\)/)
    assert.doesNotMatch(provider, /oauthLogin|signup\(/)
    assert.match(staffLogin, /passwordSetupProblem/)
    assert.match(staffLogin, /loginErrorMessage\(err\)/)
    assert.match(redirect, /callbackKind === "confirmation"/)
    assert.match(redirect, /callbackProblem/)
  })
})
