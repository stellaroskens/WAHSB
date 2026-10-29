/** Keep in sync with src/lib/auth/permissions.ts */
import { isSuperAdmin, normalizeEmail, type StaffRole } from "./roles.ts"

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
  | "prepare_connections"
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
  "prepare_connections",
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
  "prepare_connections",
]

export function permissionsForRoles(roles: unknown): StaffPermission[] {
  if (isSuperAdmin(roles)) return [...SUPER_ADMIN_PERMISSIONS]
  const list = Array.isArray(roles) ? roles.filter((r): r is string => typeof r === "string") : []
  const granted = new Set<StaffPermission>()
  if (list.includes("coach")) COACH_PERMISSIONS.forEach((p) => granted.add(p))
  if (list.includes("team_administrator")) TEAM_ADMIN_PERMISSIONS.forEach((p) => granted.add(p))
  return [...granted]
}

export function hasPermission(roles: unknown, permission: StaffPermission): boolean {
  return permissionsForRoles(roles).includes(permission)
}

export function requirePermission(
  roles: unknown,
  permission: StaffPermission,
): { ok: true } | { ok: false; message: string } {
  if (hasPermission(roles, permission)) return { ok: true }
  return { ok: false, message: `Missing permission: ${permission}` }
}

export type InviteIntent = {
  email: string
  username: string
  role: Exclude<StaffRole, "super_admin">
  invitedBy: string
  invitedAt: string
  status: "pending" | "accepted"
}

export function inviteKey(email: string): string {
  return `invite:${normalizeEmail(email)}`
}
