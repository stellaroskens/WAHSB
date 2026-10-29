import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { ADMIN_SECTIONS } from "../src/lib/auth/adminSections.ts"
import { hasPermission, permissionsForRoles } from "../src/lib/auth/permissions.ts"
import { PLANNED_STAFF } from "../src/lib/auth/staffRoster.ts"

describe("planned staff roster", () => {
  it("lists usernames and roles without inventing emails", () => {
    assert.deepEqual(
      PLANNED_STAFF.map((member) => ({ username: member.username, role: member.role })),
      [
        { username: "cmeredith", role: "coach" },
        { username: "cbreshears", role: "coach" },
        { username: "mfisher", role: "team_administrator" },
      ],
    )
    for (const member of PLANNED_STAFF) {
      assert.equal("email" in member, false)
    }
  })
})

describe("role permissions", () => {
  it("blocks coaches from payments and staff management", () => {
    const perms = permissionsForRoles(["coach"])
    assert.equal(hasPermission(["coach"], "view_coach_dashboard"), true)
    assert.equal(hasPermission(["coach"], "manage_staff_invites"), false)
    assert.equal(hasPermission(["coach"], "manage_payments"), false)
    assert.equal(perms.includes("propose_tournament_updates"), true)
  })

  it("blocks team administrators from super-admin and payouts", () => {
    assert.equal(hasPermission(["team_administrator"], "view_team_admin_dashboard"), true)
    assert.equal(hasPermission(["team_administrator"], "manage_staff_invites"), false)
    assert.equal(hasPermission(["team_administrator"], "manage_payouts"), false)
    assert.equal(hasPermission(["team_administrator"], "volunteer_coordination"), true)
  })

  it("gives super_admin staff invite and publishing rights", () => {
    assert.equal(hasPermission(["super_admin"], "manage_staff_invites"), true)
    assert.equal(hasPermission(["super_admin"], "approve_publishing"), true)
    assert.equal(hasPermission(["super_admin"], "manage_payments"), true)
  })
})

describe("admin dashboard staff section", () => {
  it("marks Staff Accounts available with a management route", () => {
    const staff = ADMIN_SECTIONS.find((section) => section.id === "staff-accounts")
    assert.ok(staff)
    assert.equal(staff?.status, "available")
    assert.equal(staff?.href, "/admin/staff")
  })
})
