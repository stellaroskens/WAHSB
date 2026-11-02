import type { Config, Context } from "@netlify/functions"
import { databaseUnavailable, withPrivateDatabase } from "./_shared/privateDb.ts"
import { ROSTER_SQL, planGuardianLink, planPrivatePlayer } from "./_shared/privateRoster.ts"
import { consumeRateLimit } from "./_shared/rateLimit.ts"
import { requireSuperAdmin } from "./_shared/requireAuth.ts"

type RosterRow = {
  id: string
  public_display_name: string | null
  status: string
  public_visibility: string
  legal_name: string | null
  identity_user_id: string | null
  relationship: string | null
}

async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json()
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null
  } catch {
    return null
  }
}

export default async (req: Request, context: Context) => {
  if (req.method !== "GET" && req.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405, headers: { "Cache-Control": "no-store" } })
  }

  const limit = consumeRateLimit(`private-roster:${context.ip || "unknown"}`, 30, 60_000)
  if (!limit.allowed) {
    return Response.json({ error: "Too many requests. Try again shortly." }, { status: 429, headers: { "Cache-Control": "no-store" } })
  }

  const auth = await requireSuperAdmin()
  if (!auth.ok) return auth.response

  if (req.method === "GET") {
    const rows = await withPrivateDatabase({ userId: auth.user.id, role: "super_admin" }, (client) =>
      client.query<RosterRow>(ROSTER_SQL),
    )
    if (!rows) return databaseUnavailable()
    const players = new Map<string, { id: string; publicDisplayName: string | null; status: string; publicVisibility: string; legalName: string | null; guardians: { identityUserId: string; relationship: string }[] }>()
    for (const row of rows.rows) {
      const current = players.get(row.id) ?? {
        id: row.id,
        publicDisplayName: row.public_display_name,
        status: row.status,
        publicVisibility: row.public_visibility,
        legalName: row.legal_name,
        guardians: [],
      }
      if (row.identity_user_id && row.relationship) {
        current.guardians.push({ identityUserId: row.identity_user_id, relationship: row.relationship })
      }
      players.set(row.id, current)
    }
    return Response.json({ players: [...players.values()] }, { headers: { "Cache-Control": "no-store" } })
  }

  const body = await readJson(req)
  if (!body) {
    return Response.json({ error: "bad_request", code: "missing", message: "The request body is not valid." }, { status: 400, headers: { "Cache-Control": "no-store" } })
  }

  const actor = { userId: auth.user.id, roles: auth.roles }

  if (body.action === "create-player") {
    const plan = planPrivatePlayer({
      actor,
      publicDisplayName: typeof body.publicDisplayName === "string" ? body.publicDisplayName : "",
    })
    if (!plan.ok) {
      return Response.json({ error: plan.code, code: plan.code, message: "The player name is not valid." }, { status: plan.status, headers: { "Cache-Control": "no-store" } })
    }
    const created = await withPrivateDatabase({ userId: auth.user.id, role: "super_admin" }, async (client) => {
      const inserted = await client.query<{ id: string }>(
        `INSERT INTO players (public_display_name, status, public_visibility) VALUES ($1, 'draft', 'private') RETURNING id`,
        [plan.publicDisplayName],
      )
      const id = inserted.rows[0]?.id
      if (!id) throw new Error("player was not created")
      await client.query(
        `INSERT INTO staff_audit_log (staff_subject, action, record_table, record_id) VALUES ($1, 'create_player', 'players', $2)`,
        [auth.user.id, id],
      )
      return id
    })
    if (!created) return databaseUnavailable()
    return Response.json({ id: created, publicVisibility: "private" }, { status: 201, headers: { "Cache-Control": "no-store" } })
  }

  const plan = planGuardianLink({
    actor,
    playerId: typeof body.playerId === "string" ? body.playerId : "",
    identityUserId: typeof body.identityUserId === "string" ? body.identityUserId : "",
    displayName: typeof body.displayName === "string" ? body.displayName : "",
    relationship: typeof body.relationship === "string" ? body.relationship : "",
    existingIdentityIds: [],
    linkedPlayerIdsForIdentity: [],
  })
  if (!plan.ok) {
    return Response.json(
      { error: plan.code, code: plan.code, message: "The guardian link is not valid." },
      { status: plan.status, headers: { "Cache-Control": "no-store" } },
    )
  }

  try {
    const linked = await withPrivateDatabase({ userId: auth.user.id, role: "super_admin" }, async (client) => {
      const player = await client.query<{ id: string }>(`SELECT id FROM players WHERE id = $1`, [plan.playerId])
      if (!player.rows[0]) return { error: "not_found" as const }
      const existing = await client.query<{ id: string; player_id: string | null }>(
        `SELECT g.id, gp.player_id
         FROM guardians g
         LEFT JOIN guardian_players gp ON gp.guardian_id = g.id
         WHERE lower(g.identity_user_id) = lower($1)`,
        [plan.identityUserId],
      )
      const guardianId = existing.rows.find((row) => row.id)?.id
      if (existing.rows.some((row) => row.player_id?.toLowerCase() === plan.playerId)) return { error: "duplicate" as const }
      let id = guardianId
      if (!id) {
        const household = await client.query<{ id: string }>(`INSERT INTO households DEFAULT VALUES RETURNING id`)
        const householdId = household.rows[0]?.id
        if (!householdId) throw new Error("household was not created")
        const guardian = await client.query<{ id: string }>(
          `INSERT INTO guardians (household_id, identity_user_id, display_name) VALUES ($1, $2, $3) RETURNING id`,
          [householdId, plan.identityUserId, plan.displayName],
        )
        id = guardian.rows[0]?.id
      }
      if (!id) throw new Error("guardian was not created")
      await client.query(
        `INSERT INTO guardian_players (guardian_id, player_id, relationship, link_status, verified_at)
         VALUES ($1, $2, $3, 'verified', now())`,
        [id, plan.playerId, plan.relationship],
      )
      await client.query(
        `INSERT INTO staff_audit_log (staff_subject, action, record_table, record_id) VALUES ($1, 'link_guardian', 'players', $2)`,
        [auth.user.id, plan.playerId],
      )
      return { error: null, guardianId: id }
    })
    if (!linked) return databaseUnavailable()
    if (linked.error === "not_found") {
      return Response.json({ error: "not_found", message: "That player is not in the private roster." }, { status: 404, headers: { "Cache-Control": "no-store" } })
    }
    if (linked.error === "duplicate") {
      return Response.json({ error: "duplicate", code: "duplicate", message: "That account is already linked to this player." }, { status: 409, headers: { "Cache-Control": "no-store" } })
    }
    return Response.json({ guardianId: linked.guardianId, linkStatus: "verified" }, { status: 201, headers: { "Cache-Control": "no-store" } })
  } catch {
    return Response.json(
      { error: "unavailable", message: "The guardian link was not saved." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    )
  }
}

export const config: Config = {
  path: "/api/private/roster",
  method: ["GET", "POST"],
}
