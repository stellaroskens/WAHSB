import { isIdentityUserId } from "./householdAccess.ts"
import { isSuperAdmin } from "./roles.ts"

export const HOUSEHOLD_PLAYERS_SQL = `
SELECT p.id, p.public_display_name, gp.relationship
FROM players p
INNER JOIN guardian_players gp ON gp.player_id = p.id
INNER JOIN guardians g ON g.id = gp.guardian_id
WHERE lower(g.identity_user_id) = lower($1)
  AND gp.link_status = 'verified'
  AND ($2::uuid IS NULL OR p.id = $2::uuid)
ORDER BY p.public_display_name
`

export const ROSTER_SQL = `
SELECT p.id,
       p.public_display_name,
       p.status,
       p.public_visibility,
       pp.legal_name,
       g.identity_user_id,
       gp.relationship
FROM players p
LEFT JOIN player_private pp ON pp.player_id = p.id
LEFT JOIN guardian_players gp ON gp.player_id = p.id AND gp.link_status = 'verified'
LEFT JOIN guardians g ON g.id = gp.guardian_id
ORDER BY p.public_display_name, g.identity_user_id
`

const DISPLAY_NAME = /^[^<>@]{1,80}$/u

export type RosterActor = {
  userId: string
  roles: readonly string[]
}

export function mayManagePrivateRoster(actor: RosterActor): boolean {
  return isIdentityUserId(actor.userId) && isSuperAdmin(actor.roles)
}

export function householdQuery(actorUserId: string, requestedPlayerId: string | null): { ok: true; params: [string, string | null] } | { ok: false; code: "missing" } {
  if (!isIdentityUserId(actorUserId)) return { ok: false, code: "missing" }
  if (requestedPlayerId !== null && !isIdentityUserId(requestedPlayerId)) return { ok: false, code: "missing" }
  return { ok: true, params: [actorUserId.toLowerCase(), requestedPlayerId?.toLowerCase() ?? null] }
}

export type GuardianLinkPlan =
  | {
      ok: true
      mode: "create-guardian" | "add-player"
      playerId: string
      identityUserId: string
      displayName: string
      relationship: "parent" | "guardian"
    }
  | { ok: false; status: 400 | 403 | 409; code: "forbidden" | "missing" | "duplicate" }

export function planGuardianLink(input: {
  actor: RosterActor
  playerId: string
  identityUserId: string
  displayName: string
  relationship: string
  existingIdentityIds: readonly string[]
  linkedPlayerIdsForIdentity: readonly string[]
}): GuardianLinkPlan {
  if (!mayManagePrivateRoster(input.actor)) return { ok: false, status: 403, code: "forbidden" }
  if (!isIdentityUserId(input.playerId) || !isIdentityUserId(input.identityUserId)) {
    return { ok: false, status: 400, code: "missing" }
  }
  const displayName = input.displayName.trim()
  if (!DISPLAY_NAME.test(displayName)) return { ok: false, status: 400, code: "missing" }
  if (input.relationship !== "parent" && input.relationship !== "guardian") {
    return { ok: false, status: 400, code: "missing" }
  }
  const identityUserId = input.identityUserId.toLowerCase()
  const playerId = input.playerId.toLowerCase()
  if (input.linkedPlayerIdsForIdentity.some((id) => id.toLowerCase() === playerId)) {
    return { ok: false, status: 409, code: "duplicate" }
  }
  const exists = input.existingIdentityIds.some((id) => id.toLowerCase() === identityUserId)
  return {
    ok: true,
    mode: exists ? "add-player" : "create-guardian",
    playerId,
    identityUserId,
    displayName,
    relationship: input.relationship,
  }
}

export function planPrivatePlayer(input: { actor: RosterActor; publicDisplayName: string }):
  | { ok: true; publicDisplayName: string }
  | { ok: false; status: 400 | 403; code: "forbidden" | "missing" } {
  if (!mayManagePrivateRoster(input.actor)) return { ok: false, status: 403, code: "forbidden" }
  const publicDisplayName = input.publicDisplayName.trim()
  if (!DISPLAY_NAME.test(publicDisplayName)) return { ok: false, status: 400, code: "missing" }
  return { ok: true, publicDisplayName }
}
