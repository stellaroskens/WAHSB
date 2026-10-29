import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { describe, it } from "node:test"
import { resolveSignupRoles } from "../netlify/functions/_shared/signupRoles.ts"
import { FUTURE_SIGN_IN_OPTIONS } from "../src/lib/auth/activation.ts"
import {
  GOOGLE_SIGN_IN_LABEL,
  GOOGLE_SIGN_IN_NOT_ENABLED,
  decideGoogleSignIn,
} from "../src/lib/auth/googleSignIn.ts"

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8")

describe("Google sign-in option", () => {
  it("starts only when Identity already reports Google as enabled", () => {
    assert.deepEqual(decideGoogleSignIn({ providers: { google: true } }), { action: "start" })
    assert.equal(decideGoogleSignIn({ providers: { google: false } }).action, "blocked")
    assert.equal(decideGoogleSignIn({ providers: {} }).action, "blocked")
    assert.equal(decideGoogleSignIn(null).action, "blocked")
    const blocked = decideGoogleSignIn({ providers: { google: false } })
    if (blocked.action === "blocked") assert.equal(blocked.message, GOOGLE_SIGN_IN_NOT_ENABLED)
    assert.equal(GOOGLE_SIGN_IN_LABEL, "Continue with Google")
    assert.equal(FUTURE_SIGN_IN_OPTIONS.google.enabled, false)
    assert.equal(FUTURE_SIGN_IN_OPTIONS.google.offeredInUi, true)
    assert.equal(FUTURE_SIGN_IN_OPTIONS.passwordless.enabled, false)
  })

  it("does not grant a staff role from a Google email", () => {
    assert.deepEqual(
      resolveSignupRoles({
        email: "person@gmail.com",
        incomingRoles: [],
        plannedRole: "",
        planned: undefined,
        allowlist: ["owner@example.org"],
      }),
      [],
    )
  })

  it("offers the button on staff sign-in and keeps it off the family tab", () => {
    const button = read("src/components/auth/GoogleSignInButton.tsx")
    const section = read("src/pages/signIn/ActivateAccountSection.tsx")
    const staff = read("src/pages/signIn/StaffSignInPanel.tsx")
    const family = read("src/pages/signIn/FamilyAccessPanel.tsx")
    const redirect = read("src/components/AuthCallbackRedirect.tsx")
    assert.match(button, /decideGoogleSignIn/)
    assert.match(button, /oauthLogin\("google"\)/)
    assert.doesNotMatch(button, /signup\(|app_metadata|roles/)
    assert.match(section, /<GoogleSignInButton \/>/)
    assert.match(staff, /<GoogleSignInButton \/>/)
    assert.doesNotMatch(family, /GoogleSignInButton|oauthLogin/)
    assert.match(redirect, /callbackKind === "oauth"/)
  })
})
