/**
 * Password-recovery messaging for the Netlify Identity recover endpoint. Identity enforces its own
 * email rate limits; this module only explains them and keeps the UI from re-sending while limited.
 */

export const RECOVERY_REQUESTED =
  "Recovery email requested. If an approved staff account uses that email, a reset link will arrive within a few minutes. Check your spam or junk folder too."

export const RECOVERY_RATE_LIMITED =
  "Too many reset emails have been requested in a short time, so Netlify is pausing new ones. Please wait at least 15 minutes before trying again. If a link already arrived, it still works."

export const RECOVERY_UNREACHABLE =
  "We could not reach the sign-in service. Check your internet connection and try again."

/** Seconds the request button stays locked after a rate-limit response. */
export const RECOVERY_RATE_LIMIT_COOLDOWN_SECONDS = 60

export type RecoveryOutcome =
  | { kind: "requested"; message: string }
  | { kind: "rate_limited"; message: string }
  | { kind: "unreachable"; message: string }

type ErrorLike = { status?: unknown; message?: unknown }

export function isRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false
  const { status, message } = error as ErrorLike
  if (status === 429) return true
  return typeof message === "string" && /rate limit|too many requests/i.test(message)
}

/**
 * Any provider answer other than a rate limit is reported as "requested" so the form never reveals
 * whether an email has an account. Only errors without an HTTP status (network failures) differ.
 */
export function recoveryOutcomeFromError(error: unknown): RecoveryOutcome {
  if (isRateLimitError(error)) return { kind: "rate_limited", message: RECOVERY_RATE_LIMITED }
  const status = error && typeof error === "object" ? (error as ErrorLike).status : undefined
  if (typeof status === "number") return { kind: "requested", message: RECOVERY_REQUESTED }
  return { kind: "unreachable", message: RECOVERY_UNREACHABLE }
}

export function recoveryHelpText(contactEmail: string): string {
  return `Still no email after 15 minutes, or still seeing errors? Email the team at ${contactEmail} and ask for the site administrator. Include your name and the email you were invited with, but never send your password.`
}
