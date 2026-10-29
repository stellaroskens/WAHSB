/** Keep in sync with src/lib/auth/roles.ts — Functions should not import from src/. */
export const SUPER_ADMIN_ROLE = "super_admin" as const
export const COACH_ROLE = "coach" as const
export const TEAM_ADMINISTRATOR_ROLE = "team_administrator" as const

export const STAFF_ROLES = [SUPER_ADMIN_ROLE, COACH_ROLE, TEAM_ADMINISTRATOR_ROLE] as const
export type StaffRole = (typeof STAFF_ROLES)[number]

export function rolesFromUser(user: {
  roles?: string[]
  appMetadata?: Record<string, unknown> | null
} | null): string[] {
  if (!user) return []
  if (Array.isArray(user.roles) && user.roles.length > 0) return user.roles
  const metaRoles = user.appMetadata?.roles
  return Array.isArray(metaRoles) ? metaRoles.filter((role): role is string => typeof role === "string") : []
}

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

export function hasRole(roles: unknown, required: StaffRole): boolean {
  return Array.isArray(roles) && roles.includes(required)
}

export function isSuperAdmin(roles: unknown): boolean {
  return hasRole(roles, SUPER_ADMIN_ROLE)
}

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
  const list = Array.isArray(roles) ? roles : []
  if (list.includes(SUPER_ADMIN_ROLE)) return SUPER_ADMIN_ROLE
  if (list.includes(COACH_ROLE)) return COACH_ROLE
  if (list.includes(TEAM_ADMINISTRATOR_ROLE)) return TEAM_ADMINISTRATOR_ROLE
  return null
}
