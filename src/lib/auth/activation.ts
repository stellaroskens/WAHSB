import type { User } from "@netlify/identity"
import { isRateLimitError } from "./recovery.ts"

/**
 * First-time activation copy and decisions.
 * The public form never creates an Identity user. Netlify Identity's invite API
 * creates an account when the address is new, and it does not resend when the
 * address already exists, so only an administrator may send invitations.
 */

export const ACTIVATION_TITLE = "ACTIVATE YOUR ACCOUNT"
export const ACTIVATION_SUBTITLE = "Getting started is easy. You only need your approved email address."
export const ACTIVATION_BUTTON = "CONTINUE WITH EMAIL"

export const ACTIVATION_LIMITATION =
  "An administrator must send your invitation before an account can be activated. Netlify Identity cannot resend that invitation from this page, and this page cannot create one. Entering an email here does not send a message, create an account, or assign a role. If you were already invited, open that email and use its link."

export const ACTIVATION_CONFIRMATION =
  "If an administrator has already sent an invitation to that address, look for it in your email. This page did not send a new invitation. If no invitation has been issued yet, nothing will arrive. This confirmation is the same for every address."

export const ACTIVATION_UNAVAILABLE =
  "The sign-in service could not be reached just now. Wait a minute and try again. No account was created."

export const ACTIVATION_RATE_LIMITED =
  "Too many attempts. Please wait before trying again. No account was created."

export const ACTIVATION_INVALID_EMAIL = "Enter an email address using a normal format, such as name@example.com."

export const AUTH_LINK_FAILED =
  "That sign-in link could not be completed. If you were invited, ask an administrator for a new invitation and open the newest email. If you already activated your account, sign in with your password."

export const INVITE_EXPIRED =
  "This invitation link is expired or invalid. Ask an administrator to send a new invitation, then open the newest message."

export const ACCOUNT_ALREADY_ACTIVATED =
  "This invitation was already used. Sign in with your password. If you forgot it, use Forgot Password. A new account was not created."

export const VERIFICATION_INCOMPLETE =
  "Email verification is not finished. Open the latest invitation or verification message and use its link before signing in."

export const PASSWORD_SAVE_FAILED =
  "The password could not be saved. Check that both entries match and use at least 5 characters, then try the link again."

export const PROFILE_SAVE_FAILED =
  "Your password is already saved, but the display name could not be saved. You can continue to your dashboard, and an administrator can correct the name."

export const ACTIVATION_STEPS = [
  {
    title: "Step 1 — Enter Your Email",
    body: "Enter the email address approved by Albany High School Bowling. Use the same address provided to club administration.",
  },
  {
    title: "Step 2 — Check Your Inbox",
    body: "Look for an account invitation or verification email associated with Albany High School Bowling and Netlify Identity.",
  },
  {
    title: "Step 3 — Verify Your Email",
    body: "Open the invitation and follow the secure verification link to continue account setup.",
  },
  {
    title: "Step 4 — Complete Your Profile",
    body: "After verification, follow the prompts to complete your account profile and create your password.",
  },
  {
    title: "Step 5 — Access Your Dashboard",
    body: "After your account is activated, sign in to view the dashboard available to your approved role.",
  },
] as const

export const ACTIVATION_EMAIL_PANEL_TITLE = "WHAT TO LOOK FOR IN YOUR EMAIL"

export const ACTIVATION_EMAIL_PANEL = [
  "Your account invitation will arrive through our secure sign-in provider, Netlify Identity. Look for a message inviting you to activate your Albany High School Bowling account. The sender and subject may vary depending on the provider's email settings.",
  "Check your Inbox, Spam, Junk, Promotions, and All Mail folders. You can also search for the terms Netlify, Identity, invitation, or Albany High School Bowling.",
  "Only use an invitation you were expecting. Check that the activation link belongs to the approved Netlify or WAHSB website before entering any personal details.",
] as const

/**
 * Google OAuth and passwordless login are intentionally off.
 * Google can be appropriate later only after Identity registration is Invite only
 * and an owner enables that provider. Passwordless magic-link login is not part of
 * the Identity API this site uses. Neither option is activated.
 */
export const FUTURE_SIGN_IN_OPTIONS = {
  google: { enabled: false as const, offeredInUi: true as const, appropriateLater: true },
  passwordless: { enabled: false as const, appropriateLater: false },
}

export const FUTURE_SIGN_IN_NOTE =
  "Passwordless sign-in is not available. Continue with Google appears on this page and starts only when Netlify Identity already has Google enabled. It does not assign a staff role."

export type ActivationPublicCode = "acknowledged" | "invalid_email" | "rate_limited" | "unavailable"

export function isPlausibleEmail(email: string): boolean {
  const value = email.trim().toLowerCase()
  if (value.length > 254 || value.length < 3) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function activationPublicResult(code: ActivationPublicCode): {
  ok: boolean
  code: ActivationPublicCode
  message: string
} {
  switch (code) {
    case "acknowledged":
      return { ok: true, code, message: ACTIVATION_CONFIRMATION }
    case "invalid_email":
      return { ok: false, code, message: ACTIVATION_INVALID_EMAIL }
    case "rate_limited":
      return { ok: false, code, message: ACTIVATION_RATE_LIMITED }
    case "unavailable":
      return { ok: false, code, message: ACTIVATION_UNAVAILABLE }
  }
}

type ErrorLike = { status?: unknown; message?: unknown }

function errorParts(error: unknown): { status?: number; message: string } {
  if (!error || typeof error !== "object") return { message: "" }
  const { status, message } = error as ErrorLike
  return {
    status: typeof status === "number" ? status : undefined,
    message: typeof message === "string" ? message : "",
  }
}

/** Maps provider failures without echoing text that could reveal an account. */
export function activationProblemFromError(error: unknown): string {
  if (isRateLimitError(error)) return ACTIVATION_RATE_LIMITED
  const { status, message } = errorParts(error)
  if (/already (registered|been registered|confirmed|exists)|user already|already been used/i.test(message)) {
    return ACCOUNT_ALREADY_ACTIVATED
  }
  if (/not confirmed|confirm your email|verification incomplete/i.test(message)) return VERIFICATION_INCOMPLETE
  if (/expired|invalid|token/i.test(message)) return INVITE_EXPIRED
  if (status == null || status === 500 || status === 502 || status === 503) return ACTIVATION_UNAVAILABLE
  return AUTH_LINK_FAILED
}

export function passwordSetupProblem(error: unknown): string {
  if (isRateLimitError(error)) return ACTIVATION_RATE_LIMITED
  const { status, message } = errorParts(error)
  if (/already (registered|been registered|confirmed|exists)|user already|already been used/i.test(message)) {
    return ACCOUNT_ALREADY_ACTIVATED
  }
  if (/expired|invalid|token/i.test(message)) return INVITE_EXPIRED
  if (status == null || status === 500 || status === 502 || status === 503) return ACTIVATION_UNAVAILABLE
  return PASSWORD_SAVE_FAILED
}

/** Display name only, plus the username already stored by an administrator. Never a role. */
export function displayNameUpdate(
  user: Pick<User, "userMetadata">,
  fullName: string,
): { data: { full_name: string; username?: string } } | null {
  const trimmed = fullName.trim().slice(0, 80)
  if (!trimmed) return null
  const raw = user.userMetadata?.username
  const username = typeof raw === "string" ? raw.trim() : ""
  if (username) return { data: { full_name: trimmed, username } }
  return { data: { full_name: trimmed } }
}

export function assignedUsername(user: Pick<User, "userMetadata"> | null | undefined): string {
  const raw = user?.userMetadata?.username
  return typeof raw === "string" ? raw.trim() : ""
}

export async function requestActivationContinue(email: string): Promise<{ ok: boolean; message: string }> {
  if (!isPlausibleEmail(email)) return { ok: false, message: ACTIVATION_INVALID_EMAIL }
  try {
    const response = await fetch("/api/staff/activation", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    })
    if (response.status === 429) return { ok: false, message: ACTIVATION_RATE_LIMITED }
    if (response.status === 400) return { ok: false, message: ACTIVATION_INVALID_EMAIL }
    if (response.ok) return { ok: true, message: ACTIVATION_CONFIRMATION }
    return { ok: false, message: ACTIVATION_UNAVAILABLE }
  } catch {
    return { ok: false, message: ACTIVATION_UNAVAILABLE }
  }
}
