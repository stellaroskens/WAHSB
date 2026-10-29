import {
  COACH_ROLE,
  SUPER_ADMIN_ROLE,
  TEAM_ADMINISTRATOR_ROLE,
  isSuperAdmin,
  normalizeRoles,
  type StaffRole,
} from "./roles.ts"

export type StaffPermission =
  | "edit_public_content"
  | "manage_staff_invites"
  | "manage_fundraising_config"
  | "approve_publishing"
  | "view_admin_audit"
  | "view_coach_dashboard"
  | "edit_coaching_info"
  | "propose_tournament_updates"
  | "submit_for_review"
  | "view_team_admin_dashboard"
  | "edit_scheduling_ops"
  | "propose_announcements"
  | "volunteer_coordination"
  | "manage_payments"
  | "manage_payouts"

const SUPER_ADMIN_PERMISSIONS: readonly StaffPermission[] = [
  "edit_public_content",
  "manage_staff_invites",
  "manage_fundraising_config",
  "approve_publishing",
  "view_admin_audit",
  "view_coach_dashboard",
  "edit_coaching_info",
  "propose_tournament_updates",
  "submit_for_review",
  "view_team_admin_dashboard",
  "edit_scheduling_ops",
  "propose_announcements",
  "volunteer_coordination",
  "manage_payments",
  "manage_payouts",
]

const COACH_PERMISSIONS: readonly StaffPermission[] = [
  "view_coach_dashboard",
  "edit_coaching_info",
  "propose_tournament_updates",
  "submit_for_review",
]

const TEAM_ADMIN_PERMISSIONS: readonly StaffPermission[] = [
  "view_team_admin_dashboard",
  "edit_scheduling_ops",
  "propose_announcements",
  "volunteer_coordination",
  "submit_for_review",
]

export function permissionsForRoles(roles: unknown): StaffPermission[] {
  if (isSuperAdmin(roles)) return [...SUPER_ADMIN_PERMISSIONS]
  const list = normalizeRoles(roles)
  const granted = new Set<StaffPermission>()
  if (list.includes(COACH_ROLE)) COACH_PERMISSIONS.forEach((p) => granted.add(p))
  if (list.includes(TEAM_ADMINISTRATOR_ROLE)) TEAM_ADMIN_PERMISSIONS.forEach((p) => granted.add(p))
  return [...granted]
}

export function hasPermission(roles: unknown, permission: StaffPermission): boolean {
  return permissionsForRoles(roles).includes(permission)
}

export function roleMayAccessPath(role: StaffRole | null, pathname: string): boolean {
  if (!role) return false
  if (role === SUPER_ADMIN_ROLE) return true
  if (role === COACH_ROLE) return pathname.startsWith("/coach")
  if (role === TEAM_ADMINISTRATOR_ROLE) return pathname.startsWith("/team-administrator")
  return false
}
