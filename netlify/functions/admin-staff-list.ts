import type { Config, Context } from "@netlify/functions"
import { admin } from "@netlify/identity"
import { PLANNED_STAFF } from "./_shared/plannedStaff.ts"
import { hasPermission } from "./_shared/permissions.ts"
import { requireSuperAdmin } from "./_shared/requireAuth.ts"
import { consumeRateLimit } from "./_shared/rateLimit.ts"
import { primaryStaffRole, rolesFromUser } from "./_shared/roles.ts"

export default async (req: Request, context: Context) => {
  if (req.method !== "GET") {
    return Response.json({ error: "Method not allowed." }, { status: 405 })
  }

  const ip = context.ip || "unknown"
  const limit = consumeRateLimit(`staff-list:${ip}`, 40, 60_000)
  if (!limit.allowed) {
    return Response.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec), "Cache-Control": "no-store" } },
    )
  }

  const auth = await requireSuperAdmin()
  if (!auth.ok) return auth.response
  if (!hasPermission(auth.roles, "manage_staff_invites")) {
    return Response.json({ error: "forbidden" }, { status: 403 })
  }

  let users: Awaited<ReturnType<typeof admin.listUsers>> = []
  try {
    users = await admin.listUsers({ perPage: 100 })
  } catch {
    users = []
  }

  const accounts = users.map((user) => {
    const roles = rolesFromUser(user)
    const username =
      typeof user.userMetadata?.username === "string" ? user.userMetadata.username : null
    return {
      id: user.id,
      email: user.email ?? null,
      username,
      roles,
      primaryRole: primaryStaffRole(roles),
      invitedAt: user.invitedAt ?? null,
      confirmedAt: user.confirmedAt ?? null,
      lastSignInAt: user.lastSignInAt ?? null,
      active: Boolean(user.confirmedAt),
    }
  })

  return Response.json(
    {
      planned: PLANNED_STAFF,
      accounts,
    },
    { headers: { "Cache-Control": "no-store" } },
  )
}

export const config: Config = {
  path: "/api/admin/staff",
  method: ["GET"],
}
