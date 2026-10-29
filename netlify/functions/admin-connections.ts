import type { Config, Context } from "@netlify/functions"
import bundledConnections from "../../src/content/published/siteConnections.json"
import {
  parseSiteConnections,
  validateSiteConnections,
  type SiteConnectionsConfig,
} from "../../src/lib/content/siteConnectionsModel.ts"
import {
  CONNECTIONS_PATH,
  getFileContent,
  githubConfig,
  putFileContent,
} from "./_shared/githubContent.ts"
import { hasPermission } from "./_shared/permissions.ts"
import { requireEnabledStaffAuth } from "./_shared/requireAuth.ts"
import { consumeRateLimit } from "./_shared/rateLimit.ts"
import { isSuperAdmin } from "./_shared/roles.ts"

function json(status: number, body: unknown): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } })
}

/** Staff may prepare destinations; only super_admin may verify or enable live payments/social/email. */
function sanitizeForRole(config: SiteConnectionsConfig, roles: unknown): SiteConnectionsConfig {
  if (isSuperAdmin(roles)) return config

  return {
    ...config,
    social: config.social.map((item) => ({
      ...item,
      status: item.status === "verified" ? "prepared" : item.status === "disabled" ? "disabled" : "prepared",
      liveEnabled: false,
    })),
    email: {
      ...config.email,
      status:
        config.email.status === "verified"
          ? "prepared"
          : config.email.status === "disabled"
            ? "disabled"
            : "prepared",
      liveEnabled: false,
    },
    payments: config.payments.map((item) => ({
      ...item,
      status: item.status === "verified" ? "prepared" : item.status === "disabled" ? "disabled" : "prepared",
      liveEnabled: false,
    })),
  }
}

export default async (req: Request, context: Context) => {
  const ip = context.ip || "unknown"
  const limit = consumeRateLimit(`admin-connections:${ip}`, 40, 60_000)
  if (!limit.allowed) return json(429, { error: "Too many requests." })

  if (req.method === "GET") {
    const auth = await requireEnabledStaffAuth()
    if (!auth.ok) return auth.response
    if (!hasPermission(auth.roles, "prepare_connections") && !hasPermission(auth.roles, "manage_payments")) {
      return json(403, { error: "forbidden" })
    }

    const gh = githubConfig()
    if (gh.ok) {
      const file = await getFileContent(gh, CONNECTIONS_PATH)
      if (file.ok) {
        try {
          const config = parseSiteConnections(JSON.parse(file.content))
          return json(200, {
            connections: config,
            canApprovePayments: hasPermission(auth.roles, "manage_payments"),
            githubConfigured: true,
          })
        } catch (error) {
          return json(500, { error: error instanceof Error ? error.message : "Invalid connections file." })
        }
      }
    }

    // Fall back to bundled published file when GitHub is not configured.
    return json(200, {
      connections: parseSiteConnections(bundledConnections),
      canApprovePayments: hasPermission(auth.roles, "manage_payments"),
      githubConfigured: false,
      note: "GITHUB_CONTENT_TOKEN not set — showing bundled connections; saves require GitHub.",
    })
  }

  if (req.method === "PUT") {
    const auth = await requireEnabledStaffAuth()
    if (!auth.ok) return auth.response
    if (!hasPermission(auth.roles, "prepare_connections") && !hasPermission(auth.roles, "manage_payments")) {
      return json(403, { error: "forbidden" })
    }

    const body = (await req.json()) as { connections?: unknown; message?: string }
    const issues = validateSiteConnections(body.connections)
    if (issues.length) return json(400, { error: "validation_failed", issues })

    let next = parseSiteConnections(body.connections)
    if (!hasPermission(auth.roles, "manage_payments")) {
      next = sanitizeForRole(next, auth.roles)
    }

    // Defense: never allow live payment without verified status.
    next = {
      ...next,
      payments: next.payments.map((item) => ({
        ...item,
        liveEnabled: item.liveEnabled === true && item.status === "verified",
      })),
      social: next.social.map((item) => ({
        ...item,
        liveEnabled: item.liveEnabled === true && item.status === "verified",
      })),
      email: {
        ...next.email,
        liveEnabled: next.email.liveEnabled === true && next.email.status === "verified",
      },
    }

    const gh = githubConfig()
    if (!gh.ok) return json(503, { error: gh.message, code: "github_token_missing" })

    const existing = await getFileContent(gh, CONNECTIONS_PATH)
    const saved = await putFileContent(
      gh,
      CONNECTIONS_PATH,
      `${JSON.stringify(next, null, 2)}\n`,
      body.message || "content: update site connections",
      existing.ok ? existing.sha : undefined,
    )
    if (!saved.ok) return json(400, { error: saved.message })

    return json(200, {
      ok: true,
      connections: next,
      commitSha: saved.commitSha,
      note: "Saved to GitHub. Live site updates after Netlify deploy. Payments stay off unless verified + liveEnabled.",
    })
  }

  return json(405, { error: "Method not allowed." })
}

export const config: Config = {
  path: "/api/admin/connections",
  method: ["GET", "PUT"],
}
