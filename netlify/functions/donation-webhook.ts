import type { Config } from "@netlify/functions"
import { verifyStripeSignature } from "../../src/lib/payments/stripeSignature.ts"

declare const Netlify: { env: { get(name: string): string | undefined } }

function json(status: number, body: unknown): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } })
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json(405, { code: "method_not_allowed", error: "Use POST.", saved: false })
  const secret = Netlify.env.get("STRIPE_WEBHOOK_SECRET") ?? ""
  const payload = await req.text()
  const verdict = await verifyStripeSignature(payload, req.headers.get("stripe-signature"), secret, Math.floor(Date.now() / 1000))
  if (verdict === "missing") {
    return json(503, { code: "webhook_not_configured", error: "The webhook secret is not configured.", saved: false })
  }
  if (verdict === "invalid") {
    return json(400, { code: "invalid_signature", error: "The webhook signature was rejected.", saved: false })
  }
  if (!Netlify.env.get("DONATION_DATABASE_URL")) {
    return json(503, {
      code: "donation_records_unavailable",
      error: "The event signature was accepted, and the gift was not saved. Private donation storage is not configured.",
      saved: false,
      paid: false,
    })
  }
  return json(503, {
    code: "record_writer_not_activated",
    error: "Storage is configured, and this release still does not write a donation row.",
    saved: false,
    paid: false,
  })
}

export const config: Config = { path: "/api/donations/webhook" }
