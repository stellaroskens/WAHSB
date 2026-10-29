import { dashboardPathForRole } from "./roles.ts"
import type { StaffSession } from "./session.ts"

export type PostLoginDecision =
  | { kind: "redirect"; path: string }
  | { kind: "blocked"; message: string; signOut: boolean }

export const LOGIN_FAILED =
  "That email and password did not work. Check both and try again, or use Forgot password. Staff accounts are invitation-only."

export const LOGIN_RATE_LIMITED = "Too many sign-in attempts. Please wait a few minutes before trying again."

export const STAFF_ACCESS_NOT_APPROVED =
  "You signed in, but this account is not approved for staff access. Its staff role may be missing, or it is not on the administrator allowlist. Ask the site administrator to check the account's roles in Netlify Identity, then sign in again."

/** Specific explanations for the server's 403 reason codes (netlify/functions/_shared/staffAccess.ts). */
export const STAFF_DENIAL_MESSAGES: Record<string, string> = {
  missing_staff_role:
    "You signed in, but this account has no staff role. A site owner must open Netlify → Identity, edit this user, add the role super_admin, coach, or team_administrator, save, and then you sign in again.",
  role_name_mismatch:
    "You signed in, but this account's role is spelled differently from what the site expects. In Netlify → Identity, the role must be exactly super_admin, coach, or team_administrator: all lowercase, with underscores, no spaces.",
  allowlist_not_configured:
    "You signed in with the super_admin role, but the site's administrator allowlist is not set. A site owner must set ADMIN_EMAIL_ALLOWLIST for Functions in Netlify, then redeploy the site.",
  super_admin_not_allowlisted:
    "You signed in with the super_admin role, but this email is not on the site's administrator allowlist. A site owner must add this exact email to ADMIN_EMAIL_ALLOWLIST in Netlify, then redeploy the site.",
}

export const STAFF_SESSION_NOT_CONFIRMED =
  "Your password was accepted, but the server could not confirm your session. Sign in again. If this keeps happening, make sure cookies are allowed for this site."

export const STAFF_ACCESS_UNAVAILABLE =
  "Staff access could not be checked right now. Wait a minute and try again."

type ErrorLike = { status?: unknown; message?: unknown }

/** Never echoes provider text, which can reveal whether an email has an account. */
export function loginErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const { status, message } = error as ErrorLike
    if (status === 429) return LOGIN_RATE_LIMITED
    if (typeof message === "string" && /rate limit|too many requests/i.test(message)) return LOGIN_RATE_LIMITED
  }
  return LOGIN_FAILED
}

/** The server session is authoritative; browser roles can be stale or missing. */
export function decidePostLogin(session: StaffSession): PostLoginDecision {
  if (session.ok) return { kind: "redirect", path: dashboardPathForRole(session.primaryRole) }
  switch (session.reason) {
    case "forbidden":
      return {
        kind: "blocked",
        message: (session.detail && STAFF_DENIAL_MESSAGES[session.detail]) || STAFF_ACCESS_NOT_APPROVED,
        signOut: true,
      }
    case "unauthorized":
      return { kind: "blocked", message: STAFF_SESSION_NOT_CONFIRMED, signOut: true }
    default:
      return { kind: "blocked", message: STAFF_ACCESS_UNAVAILABLE, signOut: false }
  }
}

/** Message for a dashboard guard that sent the user back to the login page. */
export function guardReasonMessage(reason: unknown, detail?: unknown): string | null {
  if (reason === "forbidden") {
    return (typeof detail === "string" && STAFF_DENIAL_MESSAGES[detail]) || STAFF_ACCESS_NOT_APPROVED
  }
  if (reason === "unauthorized") return STAFF_SESSION_NOT_CONFIRMED
  if (reason === "unavailable") return STAFF_ACCESS_UNAVAILABLE
  return null
}
