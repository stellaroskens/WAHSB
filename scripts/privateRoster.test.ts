import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { HOUSEHOLD_PLAYERS_SQL, ROSTER_SQL, householdQuery, mayManagePrivateRoster, planGuardianLink, planPrivatePlayer } from "../netlify/functions/_shared/privateRoster.ts"

const superAdminId = "11111111-1111-4111-8111-111111111111"
const otherParentId = "22222222-2222-4222-8222-222222222222"
const playerA = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1"
const playerB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2"
const superAdmin = { userId: superAdminId, roles: ["super_admin"] }

test("the household query is limited to the signed-in verified guardian", () => {
  assert.match(HOUSEHOLD_PLAYERS_SQL, /lower\(g\.identity_user_id\) = lower\(\$1\)/)
  assert.match(HOUSEHOLD_PLAYERS_SQL, /gp\.link_status = 'verified'/)
  assert.doesNotMatch(HOUSEHOLD_PLAYERS_SQL, /\$\{/)
  const query = householdQuery(superAdminId, playerB)
  assert.equal(query.ok, true)
  if (query.ok) assert.deepEqual(query.params, [superAdminId, playerB])
  assert.equal(householdQuery("parent@example.com", null).ok, false)
  assert.equal(householdQuery(superAdminId, "not-a-player").ok, false)
})

test("a coach cannot manage the private roster or link a guardian", () => {
  const coach = { userId: otherParentId, roles: ["coach"] }
  assert.equal(mayManagePrivateRoster(coach), false)
  assert.equal(mayManagePrivateRoster({ userId: otherParentId, roles: ["team_administrator"] }), false)
  assert.equal(
    planGuardianLink({
      actor: coach,
      playerId: playerA,
      identityUserId: otherParentId,
      displayName: "Fictional Guardian",
      relationship: "guardian",
      existingIdentityIds: [],
      linkedPlayerIdsForIdentity: [],
    }).ok,
    false,
  )
  assert.equal(planPrivatePlayer({ actor: coach, publicDisplayName: "Fictional Bowler A" }).ok, false)
})

test("the existing super_admin account can be linked once without a second account", () => {
  assert.equal(mayManagePrivateRoster(superAdmin), true)
  const created = planGuardianLink({
    actor: superAdmin,
    playerId: playerA,
    identityUserId: superAdminId.toUpperCase(),
    displayName: "Fictional Guardian A",
    relationship: "guardian",
    existingIdentityIds: [],
    linkedPlayerIdsForIdentity: [],
  })
  assert.equal(created.ok && created.mode, "create-guardian")
  assert.equal(created.ok && created.identityUserId, superAdminId)
  const sibling = planGuardianLink({
    actor: superAdmin,
    playerId: playerB,
    identityUserId: superAdminId,
    displayName: "Fictional Guardian A",
    relationship: "parent",
    existingIdentityIds: [superAdminId],
    linkedPlayerIdsForIdentity: [playerA],
  })
  assert.equal(sibling.ok && sibling.mode, "add-player")
  const duplicate = planGuardianLink({
    actor: superAdmin,
    playerId: playerA,
    identityUserId: superAdminId,
    displayName: "Fictional Guardian A",
    relationship: "guardian",
    existingIdentityIds: [superAdminId],
    linkedPlayerIdsForIdentity: [playerA],
  })
  assert.deepEqual(duplicate, { ok: false, status: 409, code: "duplicate" })
  const email = planGuardianLink({
    actor: superAdmin,
    playerId: playerA,
    identityUserId: "parent@example.com",
    displayName: "Fictional Guardian A",
    relationship: "guardian",
    existingIdentityIds: [],
    linkedPlayerIdsForIdentity: [],
  })
  assert.equal(email.ok, false)
})

test("private names stay out of the browser bundle and the roster query is staff-only in source", () => {
  const household = readFileSync(new URL("../netlify/functions/private-household.ts", import.meta.url), "utf8")
  const roster = readFileSync(new URL("../netlify/functions/private-roster.ts", import.meta.url), "utf8")
  const database = readFileSync(new URL("../netlify/functions/_shared/privateDb.ts", import.meta.url), "utf8")
  assert.match(household, /HOUSEHOLD_PLAYERS_SQL/)
  assert.doesNotMatch(household, /legal_name/)
  assert.match(roster, /requireSuperAdmin/)
  assert.match(database, /@netlify\/database/)
  assert.match(ROSTER_SQL, /legal_name/)
  assert.doesNotMatch(readFileSync(new URL("../package.json", import.meta.url), "utf8"), /@netlify\/database/)
})
