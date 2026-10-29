import type { Config, Context } from "@netlify/functions"
import { requireEnabledStaffAuth } from "./_shared/requireAuth.ts"
import { consumeRateLimit } from "./_shared/rateLimit.ts"

export default async (req: Request, context: Context) => {
  if (req.method !== "GET") {
    return Response.json({ error: "Method not allowed." }, { status: 405 })
  }

  const ip = context.ip || "unknown"
  const limit = consumeRateLimit(`staff-session:${ip}`, 60, 60_000)
  if (!limit.allowed) {
    return Response.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec), "Cache-Control": "no-store" } },
    )
  }

  const auth = await requireEnabledStaffAuth()
  if (!auth.ok) return auth.response

  const username =
    typeof auth.user.userMetadata?.username === "string" ? auth.user.userMetadata.username : null

  return Response.json(
    {
      id: auth.user.id,
      email: auth.email,
      roles: auth.roles,
      primaryRole: auth.primaryRole,
      username,
    },
    { headers: { "Cache-Control": "no-store" } },
  )
}

export const config: Config = {
  path: "/api/staff/session",
  method: ["GET"],
}
