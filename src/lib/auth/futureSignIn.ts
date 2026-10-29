/**
 * Investigated and left off.
 *
 * Google: Identity can offer Google after an owner enables it under
 * Project configuration > Identity > External providers. Registration defaults
 * to open, so Google must stay off until registration is invite-only. This
 * site does not call oauthLogin.
 *
 * Passwordless: @netlify/identity has no magic-link login. Invitation links
 * and password recovery are the supported email messages, and both still ask
 * for a password when the provider requires one.
 */
export { FUTURE_SIGN_IN_NOTE, FUTURE_SIGN_IN_OPTIONS } from "./activation.ts"
