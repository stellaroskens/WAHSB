import { normalizeEmail, primaryStaffRole, STAFF_ROLES, type StaffRole } from "./roles.ts"

/** Why an authenticated Identity user was refused staff access. Safe to return to that user. */
export type StaffAccessDenial =
  | "missing_staff_role"
  | "role_name_mismatch"
  | "allowlist_not_configured"
  | "super_admin_not_allowlisted"

export type StaffAccessDecision =
  | { ok: true; primaryRole: StaffRole }
  | { ok: false; code: StaffAccessDenial; message: string }

function looksLikeStaffRole(role: string): boolean {
  const canonical = role.trim().toLowerCase().replace(/[\s-]+/g, "_")
  return (STAFF_ROLES as readonly string[]).includes(canonical) && canonical !== role
}

/**
 * Roles must match exactly (CDN Role redirects compare exact strings too). A near-miss such as
 * "Super_Admin" is reported, never accepted. Super admins must also be on the allowlist.
 */
export function decideStaffAccess(input: {
  roles: readonly string[]
  email: string | null | undefined
  allowlist: readonly string[]
}): StaffAccessDecision {
  const primaryRole = primaryStaffRole(input.roles)
  if (!primaryRole) {
    if (input.roles.some(looksLikeStaffRole)) {
      return {
        ok: false,
        code: "role_name_mismatch",
        message: "The account's role name does not exactly match super_admin, coach, or team_administrator.",
      }
    }
    return { ok: false, code: "missing_staff_role", message: "Staff role required." }
  }

  if (primaryRole === "super_admin") {
    if (input.allowlist.length === 0) {
      return {
        ok: false,
        code: "allowlist_not_configured",
        message: "ADMIN_EMAIL_ALLOWLIST is not available to the site's functions.",
      }
    }
    if (!input.allowlist.includes(normalizeEmail(input.email))) {
      return {
        ok: false,
        code: "super_admin_not_allowlisted",
        message: "Account is not allowlisted for administrator access.",
      }
    }
  }

  return { ok: true, primaryRole }
}
