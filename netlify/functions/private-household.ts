import type { Config, Context } from "@netlify/functions"
import { databaseUnavailable, withPrivateDatabase } from "./_shared/privateDb.ts"
import { HOUSEHOLD_PLAYERS_SQL, householdQuery } from "./_shared/privateRoster.ts"
import { consumeRateLimit } from "./_shared/rateLimit.ts"
import { requireIdentityUser } from "./_shared/requireAuth.ts"
import { rolesFromUser } from "./_shared/roles.ts"

export default async (req: Request, context: Context) => {
  if (req.method !== "GET") {
    return Response.json({ error: "Method not allowed." }, { status: 405, headers: { "Cache-Control": "no-store" } })
  }

  const limit = consumeRateLimit(`private-household:${context.ip || "unknown"}`, 60, 60_000)
  if (!limit.allowed) {
    return Response.json({ error: "Too many requests. Try again shortly." }, { status: 429, headers: { "Cache-Control": "no-store" } })
  }

  const auth = await requireIdentityUser(context)
  if (!auth.ok) return auth.response
  const user = auth.user

  const requested = new URL(req.url).searchParams.get("playerId")
  const query = householdQuery(user.id, requested)
  if (!query.ok) {
    return Response.json({ error: "bad_request", code: "missing", message: "The account id is not valid." }, { status: 400, headers: { "Cache-Control": "no-store" } })
  }

  const roles = rolesFromUser(user)
  const rows = await withPrivateDatabase({ userId: user.id, role: roles.includes("super_admin") ? "super_admin" : "" }, (client) =>
    client.query<{ id: string; public_display_name: string | null; relationship: string }>(HOUSEHOLD_PLAYERS_SQL, query.params),
  )
  if (!rows) return databaseUnavailable()

  if (requested && rows.rows.length === 0) {
    return Response.json(
      { error: "not_found", message: "That bowler is not in your verified household." },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    )
  }

  return Response.json(
    {
      players: rows.rows.map((row) => ({
        id: row.id,
        publicDisplayName: row.public_display_name,
        relationship: row.relationship,
      })),
    },
    { headers: { "Cache-Control": "no-store" } },
  )
}

export const config: Config = {
  path: "/api/private/household",
  method: ["GET"],
}
