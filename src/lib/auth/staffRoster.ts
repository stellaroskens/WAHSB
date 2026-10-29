import { COACH_ROLE, TEAM_ADMINISTRATOR_ROLE, type StaffRole } from "./roles"

/**
 * Planned staff accounts — usernames and roles only.
 * Emails are supplied by the super admin at invite time and are never invented here.
 * Accounts stay inactive until each person accepts a verified invitation.
 */
export type PlannedStaffMember = {
  username: string
  displayName: string
  role: Exclude<StaffRole, "super_admin">
  title: string
}

export const PLANNED_STAFF: readonly PlannedStaffMember[] = [
  {
    username: "cmeredith",
    displayName: "Cliff Meredith",
    role: COACH_ROLE,
    title: "Coach",
  },
  {
    username: "cbreshears",
    displayName: "Chris Breshears",
    role: COACH_ROLE,
    title: "Coach",
  },
  {
    username: "mfisher",
    displayName: "Maranda Fisher",
    role: TEAM_ADMINISTRATOR_ROLE,
    title: "Team Administrator",
  },
] as const

export function findPlannedStaffByUsername(username: string): PlannedStaffMember | undefined {
  const normalized = username.trim().toLowerCase()
  return PLANNED_STAFF.find((member) => member.username === normalized)
}
