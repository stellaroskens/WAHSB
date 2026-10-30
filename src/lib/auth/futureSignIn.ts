/**
 * Investigated and left off.
 *
 * Google: the sign-in page offers Continue with Google. The redirect runs only
 * after getSettings() reports the Google provider. This code does not enable
 * that provider. Keep Identity registration invite-only. A Google login does
 * not assign a role.
 *
 * Passwordless: @netlify/identity has no magic-link login. Invitation links
 * and password recovery are the supported email messages, and both still ask
 * for a password when the provider requires one.
 */
export { FUTURE_SIGN_IN_NOTE, FUTURE_SIGN_IN_OPTIONS } from "./activation.ts"
