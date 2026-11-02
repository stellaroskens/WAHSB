import type { Config, Context } from "@netlify/functions"
import bundledConnections from "../../src/content/published/siteConnections.json"
import { systemStatusReport } from "../../src/lib/admin/systemStatus.ts"
import { parseSiteConnections } from "../../src/lib/content/siteConnectionsModel.ts"
import { FAMILY_ACCESS_OPEN } from "../../src/lib/family/familyAccess.ts"
import { requireSuperAdmin } from "./_shared/requireAuth.ts"
import { consumeRateLimit } from "./_shared/rateLimit.ts"

declare const Netlify: { env: { get(name: string): string | undefined } }

function configured(name: string): boolean {
  const value = Netlify.env.get(name)
  return typeof value === "string" && value.trim().length > 0
}

export default async (req: Request, context: Context) => {
  if (req.method !== "GET") {
    return Response.json({ error: "Method not allowed." }, { status: 405, headers: { "Cache-Control": "no-store" } })
  }

  const limit = consumeRateLimit(`system-status:${context.ip || "unknown"}`, 30, 60_000)
  if (!limit.allowed) {
    return Response.json({ error: "Too many requests." }, { status: 429, headers: { "Cache-Control": "no-store" } })
  }

  const auth = await requireSuperAdmin()
  if (!auth.ok) return auth.response

  const connections = parseSiteConnections(bundledConnections)
  const report = systemStatusReport({
    githubContentTokenConfigured: configured("GITHUB_CONTENT_TOKEN"),
    adminAuthEnabled: Netlify.env.get("ADMIN_AUTH_ENABLED") === "true",
    consentDatabaseConfigured: configured("BOWLER_CONSENT_DATABASE_URL"),
    emailStatus: connections.email.status,
    emailLive: connections.email.liveEnabled === true,
    payments: connections.payments.map((payment) => ({
      id: payment.id,
      label: payment.label,
      status: payment.status,
      liveEnabled: payment.liveEnabled === true,
    })),
    familyAccessOpen: FAMILY_ACCESS_OPEN,
  })

  return Response.json(report, { headers: { "Cache-Control": "no-store" } })
}

export const config: Config = {
  path: "/api/admin/system-status",
  method: ["GET"],
}
