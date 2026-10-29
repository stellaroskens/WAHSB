import { PRIVILEGED_ROLE_NAMES } from "./privilegedRoles.ts"
import { normalizeEmail, SUPER_ADMIN_ROLE } from "./roles.ts"

export type PlannedStaffMatch = { username: string; role: string } | undefined

/**
 * Roles an invited user keeps when the Identity signup event fires on invite acceptance.
 * app_metadata can only be written by a site owner (Netlify UI or admin API), so a super_admin
 * role placed there survives, but only for an email on ADMIN_EMAIL_ALLOWLIST. Other privileged
 * roles still come solely from the approved planned-staff roster.
 */
export function resolveSignupRoles(input: {
  email: string | null | undefined
  incomingRoles: readonly string[]
  plannedRole: string
  planned: PlannedStaffMatch
  allowlist: readonly string[]
}): string[] {
  const privileged = PRIVILEGED_ROLE_NAMES as readonly string[]
  const roles = new Set(input.incomingRoles.filter((role) => !privileged.includes(role)))

  if (input.planned && input.plannedRole === input.planned.role) {
    roles.add(input.planned.role)
  }

  const email = normalizeEmail(input.email)
  if (input.incomingRoles.includes(SUPER_ADMIN_ROLE) && email && input.allowlist.includes(email)) {
    roles.add(SUPER_ADMIN_ROLE)
  }

  return [...roles]
}
