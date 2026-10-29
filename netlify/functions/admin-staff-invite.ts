import type { Config, Context } from "@netlify/functions"
import { AuthError, getIdentityConfig } from "@netlify/identity"
import { findPlannedStaffByUsername } from "./_shared/plannedStaff.ts"
import { hasPermission } from "./_shared/permissions.ts"
import { requireSuperAdmin } from "./_shared/requireAuth.ts"
import { normalizeEmail } from "./_shared/roles.ts"
import { consumeRateLimit } from "./_shared/rateLimit.ts"

type InviteBody = {
  email?: string
  username?: string
}

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405 })
  }

  const ip = context.ip || "unknown"
  const limit = consumeRateLimit(`staff-invite:${ip}`, 10, 15 * 60_000)
  if (!limit.allowed) {
    return Response.json(
      { error: "Too many invite attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec), "Cache-Control": "no-store" } },
    )
  }

  const auth = await requireSuperAdmin()
  if (!auth.ok) return auth.response
  if (!hasPermission(auth.roles, "manage_staff_invites")) {
    return Response.json({ error: "forbidden", message: "Staff invite permission required." }, { status: 403 })
  }

  let body: InviteBody
  try {
    body = (await req.json()) as InviteBody
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const email = normalizeEmail(body.email)
  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : ""
  if (!email || !email.includes("@")) {
    return Response.json({ error: "A real staff email is required. Do not invent one." }, { status: 400 })
  }
  if (!username) {
    return Response.json({ error: "Username is required." }, { status: 400 })
  }

  const planned = findPlannedStaffByUsername(username)
  if (!planned) {
    return Response.json(
      { error: "Username is not on the approved planned staff roster." },
      { status: 400 },
    )
  }

  const config = getIdentityConfig()
  if (!config?.url || !config.token) {
    return Response.json(
      { error: "Identity admin token unavailable. Enable Identity and deploy on Netlify." },
      { status: 503 },
    )
  }

  try {
    const response = await fetch(`${config.url}/invite`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        data: {
          username: planned.username,
          full_name: planned.displayName,
          planned_role: planned.role,
          invited_by: auth.email,
          // Roles are NOT granted here. identity-signup assigns them only after invite acceptance.
        },
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      return Response.json(
        {
          error: "Invite failed.",
          detail: text.slice(0, 300),
        },
        { status: response.status === 422 ? 422 : 400 },
      )
    }

    return Response.json(
      {
        ok: true,
        email,
        username: planned.username,
        role: planned.role,
        status: "invitation_sent",
        note: "Account stays inactive until the invite is accepted and a password is set. Role is assigned only after verification.",
      },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 400 })
    }
    return Response.json({ error: "Invite request failed." }, { status: 500 })
  }
}

export const config: Config = {
  path: "/api/admin/staff/invite",
  method: ["POST"],
}
