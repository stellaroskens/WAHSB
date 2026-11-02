import assert from "node:assert/strict"
import test from "node:test"
import { claimGuardianIdentity, mayReadHousehold } from "../netlify/functions/_shared/householdAccess.ts"

const superAdminId = "11111111-1111-4111-8111-111111111111"
const otherParentId = "22222222-2222-4222-8222-222222222222"
const verifiedOwnLink = [{ identityUserId: superAdminId, linkStatus: "verified" as const }]

test("the same Identity user can be a guardian without a second account", () => {
  assert.deepEqual(claimGuardianIdentity([], superAdminId), { ok: true })
  assert.equal(
    mayReadHousehold({
      actorUserId: superAdminId,
      actorRoles: ["super_admin"],
      links: verifiedOwnLink,
    }),
    true,
  )
})

test("a second claim for the same Identity user is rejected", () => {
  assert.deepEqual(claimGuardianIdentity([superAdminId], superAdminId.toUpperCase()), {
    ok: false,
    reason: "duplicate",
  })
  assert.deepEqual(claimGuardianIdentity([], "parent@example.com"), { ok: false, reason: "missing" })
})

test("another household cannot be opened by a coach, club administrator, or different parent", () => {
  assert.equal(
    mayReadHousehold({
      actorUserId: otherParentId,
      actorRoles: [],
      links: verifiedOwnLink,
    }),
    false,
  )
  assert.equal(
    mayReadHousehold({
      actorUserId: otherParentId,
      actorRoles: ["coach"],
      links: verifiedOwnLink,
    }),
    false,
  )
  assert.equal(
    mayReadHousehold({
      actorUserId: otherParentId,
      actorRoles: ["team_administrator"],
      links: verifiedOwnLink,
    }),
    false,
  )
  assert.equal(
    mayReadHousehold({
      actorUserId: "not-an-id",
      actorRoles: ["super_admin"],
      links: verifiedOwnLink,
    }),
    false,
  )
})

test("a pending or revoked link does not open the household", () => {
  assert.equal(
    mayReadHousehold({
      actorUserId: superAdminId,
      actorRoles: [],
      links: [{ identityUserId: superAdminId, linkStatus: "pending" }],
    }),
    false,
  )
  assert.equal(
    mayReadHousehold({
      actorUserId: superAdminId,
      actorRoles: [],
      links: [{ identityUserId: superAdminId, linkStatus: "revoked" }],
    }),
    false,
  )
})

test("super_admin keeps staff review access without replacing the guardian link", () => {
  assert.equal(
    mayReadHousehold({
      actorUserId: superAdminId,
      actorRoles: ["super_admin"],
      links: [{ identityUserId: otherParentId, linkStatus: "verified" }],
    }),
    true,
  )
})
