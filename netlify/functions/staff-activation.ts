import type { Config, Context } from "@netlify/functions"
import { activationPublicResult, isPlausibleEmail } from "../../src/lib/auth/activation.ts"
import { consumeRateLimit } from "./_shared/rateLimit.ts"
import { isAdminAuthEnabledServer } from "./_shared/requireAuth.ts"

/**
 * Public acknowledgement only. Does not call the Identity invite API,
 * does not create users, and does not assign roles. Administrators send
 * invitations from the staff invite function.
 */
export default async (req: Request, context: Context) => {
  const headers = { "Cache-Control": "no-store" }

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405, headers })
  }

  const ip = context.ip || "unknown"
  const limit = consumeRateLimit(`activation:${ip}`, 8, 15 * 60_000)
  if (!limit.allowed) {
    return Response.json(activationPublicResult("rate_limited"), {
      status: 429,
      headers: { ...headers, "Retry-After": String(limit.retryAfterSec) },
    })
  }

  if (!isAdminAuthEnabledServer()) {
    return Response.json(activationPublicResult("unavailable"), { status: 503, headers })
  }

  let email = ""
  try {
    const body = (await req.json()) as { email?: unknown }
    email = typeof body.email === "string" ? body.email : ""
  } catch {
    return Response.json(activationPublicResult("invalid_email"), { status: 400, headers })
  }

  if (!isPlausibleEmail(email)) {
    return Response.json(activationPublicResult("invalid_email"), { status: 400, headers })
  }

  return Response.json(activationPublicResult("acknowledged"), { headers })
}

export const config: Config = {
  path: "/api/staff/activation",
  method: ["POST"],
}
