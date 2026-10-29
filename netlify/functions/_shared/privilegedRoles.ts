/** Privileged Identity roles that must never be self-assigned at signup. */
export const PRIVILEGED_ROLE_NAMES = [
  "super_admin",
  "admin",
  "coach",
  "team_administrator",
] as const

export type PrivilegedRoleName = (typeof PRIVILEGED_ROLE_NAMES)[number]
