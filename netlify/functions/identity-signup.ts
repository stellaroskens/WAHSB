import type { Handler, HandlerContext, HandlerEvent } from "@netlify/functions"
import { findPlannedStaffByUsername } from "./_shared/plannedStaff.ts"
import { parseEmailAllowlist } from "./_shared/roles.ts"
import { resolveSignupRoles } from "./_shared/signupRoles.ts"

declare const Netlify: { env: { get(name: string): string | undefined } } | undefined

function readAllowlist(): string[] {
  const raw =
    (typeof Netlify !== "undefined" ? Netlify.env.get("ADMIN_EMAIL_ALLOWLIST") : undefined) ??
    process.env.ADMIN_EMAIL_ALLOWLIST
  return parseEmailAllowlist(raw)
}

/**
 * Runs when an invited user accepts and the Identity user record is finalized.
 * Coach and team administrator roles are assigned only when username + planned_role match the
 * approved roster. An owner-assigned super_admin role is kept only for an allowlisted email.
 * Typing an email alone never grants access.
 */
const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  const payload = JSON.parse(event.body || "{}") as {
    user?: {
      email?: string
      app_metadata?: Record<string, unknown>
      user_metadata?: Record<string, unknown>
    }
  }
  const user = payload.user ?? {}
  const existingApp = user.app_metadata ?? {}
  const existingMeta = user.user_metadata ?? {}

  const username = typeof existingMeta.username === "string" ? existingMeta.username.trim().toLowerCase() : ""
  const plannedRole =
    typeof existingMeta.planned_role === "string" ? existingMeta.planned_role.trim().toLowerCase() : ""
  const planned = username ? findPlannedStaffByUsername(username) : undefined

  const incomingRoles = Array.isArray(existingApp.roles)
    ? existingApp.roles.filter((role): role is string => typeof role === "string")
    : []

  const roles = resolveSignupRoles({
    email: user.email,
    incomingRoles,
    plannedRole,
    planned,
    allowlist: readAllowlist(),
  })

  return {
    statusCode: 200,
    body: JSON.stringify({
      app_metadata: {
        ...existingApp,
        roles,
      },
      user_metadata: {
        ...existingMeta,
        username: planned?.username ?? username ?? undefined,
        full_name: planned?.displayName ?? existingMeta.full_name,
        // Clear the one-time invite intent marker from lasting user-editable expectations.
        planned_role: planned && plannedRole === planned.role ? planned.role : undefined,
        invite_accepted_at: new Date().toISOString(),
      },
    }),
  }
}

export { handler }
