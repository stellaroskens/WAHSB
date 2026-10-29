/** Server-controlled Identity roles for WAHSB staff. Never self-assign from the browser. */
export const SUPER_ADMIN_ROLE = "super_admin" as const
export const COACH_ROLE = "coach" as const
export const TEAM_ADMINISTRATOR_ROLE = "team_administrator" as const

export const STAFF_ROLES = [SUPER_ADMIN_ROLE, COACH_ROLE, TEAM_ADMINISTRATOR_ROLE] as const
export type StaffRole = (typeof STAFF_ROLES)[number]

/** Roles that must never be granted via public signup metadata. */
export const PRIVILEGED_ROLES = [...STAFF_ROLES, "admin"] as const

export function normalizeEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase()
}

export function parseEmailAllowlist(raw: string | null | undefined): string[] {
  if (!raw) return []
  return raw
    .split(/[,;\s]+/)
    .map((part) => normalizeEmail(part.replace(/^["']+|["']+$/g, "")))
    .filter(Boolean)
}

export function normalizeRoles(roles: unknown): string[] {
  if (!Array.isArray(roles)) return []
  return roles.filter((role): role is string => typeof role === "string" && role.length > 0)
}

export function hasRole(roles: unknown, required: StaffRole): boolean {
  return normalizeRoles(roles).includes(required)
}

export function isSuperAdmin(roles: unknown): boolean {
  return hasRole(roles, SUPER_ADMIN_ROLE)
}

/**
 * Privileged access requires the Identity role AND (when required) an allowlisted email.
 * Typing an email into a form never grants a role. An empty allowlist fails closed when required.
 */
export function isAuthorizedSuperAdmin(input: {
  roles: unknown
  email: string | null | undefined
  allowlist: readonly string[]
  requireAllowlist: boolean
}): boolean {
  if (!isSuperAdmin(input.roles)) return false
  const email = normalizeEmail(input.email)
  if (!email) return false
  if (!input.requireAllowlist) return true
  if (input.allowlist.length === 0) return false
  return input.allowlist.includes(email)
}

export function isCoach(roles: unknown): boolean {
  return hasRole(roles, COACH_ROLE) || isSuperAdmin(roles)
}

export function isTeamAdministrator(roles: unknown): boolean {
  return hasRole(roles, TEAM_ADMINISTRATOR_ROLE) || isSuperAdmin(roles)
}

export function primaryStaffRole(roles: unknown): StaffRole | null {
  const list = normalizeRoles(roles)
  if (list.includes(SUPER_ADMIN_ROLE)) return SUPER_ADMIN_ROLE
  if (list.includes(COACH_ROLE)) return COACH_ROLE
  if (list.includes(TEAM_ADMINISTRATOR_ROLE)) return TEAM_ADMINISTRATOR_ROLE
  return null
}

export function dashboardPathForRole(role: StaffRole | null): string {
  switch (role) {
    case SUPER_ADMIN_ROLE:
      return "/admin"
    case COACH_ROLE:
      return "/coach"
    case TEAM_ADMINISTRATOR_ROLE:
      return "/team-administrator"
    default:
      return "/staff/login"
  }
}

/** Dashboard for a signed-in user's trusted Identity roles, or null when they hold no staff role. */
export function staffHomePath(roles: unknown): string | null {
  const role = primaryStaffRole(roles)
  return role ? dashboardPathForRole(role) : null
}
