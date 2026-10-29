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
      return { kind: "blocked", message: STAFF_ACCESS_NOT_APPROVED, signOut: true }
    case "unauthorized":
      return { kind: "blocked", message: STAFF_SESSION_NOT_CONFIRMED, signOut: true }
    default:
      return { kind: "blocked", message: STAFF_ACCESS_UNAVAILABLE, signOut: false }
  }
}

/** Message for a dashboard guard that sent the user back to the login page. */
export function guardReasonMessage(reason: unknown): string | null {
  if (reason === "forbidden") return STAFF_ACCESS_NOT_APPROVED
  if (reason === "unauthorized") return STAFF_SESSION_NOT_CONFIRMED
  if (reason === "unavailable") return STAFF_ACCESS_UNAVAILABLE
  return null
}
