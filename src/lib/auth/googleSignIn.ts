/**
 * Google is offered in the sign-in UI, but this module does not enable the
 * provider. Netlify Identity starts the redirect only when External providers
 * already has Google turned on. A Google login never assigns a staff role.
 */

export const GOOGLE_SIGN_IN_LABEL = "Continue with Google"

export const GOOGLE_SIGN_IN_HELP =
  "Google sign-in uses the existing Netlify Identity account. It does not assign a coach, Club Administrator, or super administrator role. Dashboard access still requires an invitation and a server-confirmed role."

export const GOOGLE_SIGN_IN_NOT_ENABLED =
  "Google is not turned on for this site yet. A site owner must open Netlify → Project configuration → Identity → External providers and enable Google. Keep registration set to Invite only so a new Google visit cannot create a staff account."

export const GOOGLE_SIGN_IN_UNAVAILABLE =
  "Google sign-in could not be checked just now. Wait a minute and try again. No account was created."

export type GoogleProviderSettings = {
  providers?: { google?: boolean }
} | null

export function decideGoogleSignIn(
  settings: GoogleProviderSettings,
): { action: "start" } | { action: "blocked"; message: string } {
  if (!settings) return { action: "blocked", message: GOOGLE_SIGN_IN_UNAVAILABLE }
  if (settings.providers?.google !== true) return { action: "blocked", message: GOOGLE_SIGN_IN_NOT_ENABLED }
  return { action: "start" }
}
