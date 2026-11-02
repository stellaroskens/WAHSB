import type { Config, Context } from "@netlify/functions"
import bundledConnections from "../../src/content/published/siteConnections.json"
import { parseSiteConnections } from "../../src/lib/content/siteConnectionsModel.ts"
import { decideDonationCheckout } from "../../src/lib/payments/donations.ts"
import { consumeRateLimit } from "./_shared/rateLimit.ts"

declare const Netlify: { env: { get(name: string): string | undefined } }

function json(status: number, body: unknown): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } })
}

export default async function handler(req: Request, context: Context): Promise<Response> {
  if (req.method !== "POST") return json(405, { code: "method_not_allowed", error: "Use POST.", paid: false, saved: false })
  const limit = consumeRateLimit(`donate:${context.ip ?? "unknown"}`, 20, 60_000)
  if (!limit.allowed) return json(429, { code: "rate_limited", error: "Wait a moment and try again.", paid: false, saved: false })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return json(400, { code: "invalid_json", error: "Send the amount in cents as JSON.", paid: false, saved: false })
  }
  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {}
  const connections = parseSiteConnections(bundledConnections)
  const decision = decideDonationCheckout({
    amountCents: record.amountCents,
    method: record.method,
    paymentsLive: Netlify.env.get("PAYMENTS_LIVE") === "true",
    recordsConfigured: Boolean(Netlify.env.get("DONATION_DATABASE_URL")),
    stripeConfigured: Boolean(Netlify.env.get("STRIPE_SECRET_KEY")),
    connections,
  })
  if (!decision.ok) return json(decision.status, decision)

  // Reachable only after the owner turns on PAYMENTS_LIVE, a verified destination,
  // a private record store, and the provider secret. The browser price is not used.
  return json(503, {
    code: "checkout_not_activated",
    error: "Checkout session creation is present but not activated. No charge was created.",
    paid: false,
    saved: false,
    amountCents: decision.amountCents,
    currency: decision.currency,
  })
}

export const config: Config = { path: "/api/donations/checkout" }
