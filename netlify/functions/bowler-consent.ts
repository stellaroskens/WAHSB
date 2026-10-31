import type { Config, Context } from "@netlify/functions"
import { CONSENT_NOT_SAVED, CONSENT_STORE_SETUP, consentAllowsPublication, readConsentRecord } from "../../src/lib/content/bowlerConsent.ts"
import { hasPermission } from "./_shared/permissions.ts"
import { consumeRateLimit } from "./_shared/rateLimit.ts"
import { requireSuperAdmin } from "./_shared/requireAuth.ts"

function json(status: number, body: unknown): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } })
}

/**
 * Consent stays out of GitHub. This function does not write a file, even when
 * a database variable exists, until a reviewed database client is added.
 */
export default async (req: Request, context: Context) => {
  if (req.method !== "POST") return json(405, { error: "Consent records cannot be read from the public site." })

  const ip = context.ip || "unknown"
  const limit = consumeRateLimit(`bowler-consent:${ip}`, 20, 60_000)
  if (!limit.allowed) return json(429, { error: "Too many requests." })

  const auth = await requireSuperAdmin()
  if (!auth.ok) return auth.response
  if (!hasPermission(auth.roles, "edit_public_content")) {
    return json(403, { error: "Only a super administrator can prepare bowler consent." })
  }

  const parsed = readConsentRecord(await req.json().catch(() => null))
  if (!parsed.ok) return json(400, { error: parsed.reason, saved: false })

  const decision = consentAllowsPublication(parsed.record)
  const database = Netlify.env.get("BOWLER_CONSENT_DATABASE_URL")
  return json(503, {
    error: CONSENT_NOT_SAVED,
    code: database ? "consent_store_unwired" : "consent_store_missing",
    saved: false,
    wouldAllowPublication: decision.ok,
    reason: decision.ok ? "The private record would allow a later publish, but it was not stored." : decision.reason,
    setup: CONSENT_STORE_SETUP,
  })
}

export const config: Config = {
  path: "/api/admin/bowler-consent",
  method: ["POST"],
}
