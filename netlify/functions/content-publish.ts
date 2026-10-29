import type { Config, Context } from "@netlify/functions"
import { parseSiteContent, validateSiteContent } from "../../src/lib/content/siteContent.ts"
import {
  DRAFTS_PREFIX,
  getFileContent,
  githubConfig,
  PUBLISHED_PATH,
  putFileContent,
} from "./_shared/githubContent.ts"
import { hasPermission } from "./_shared/permissions.ts"
import { requireSuperAdmin } from "./_shared/requireAuth.ts"
import { consumeRateLimit } from "./_shared/rateLimit.ts"

function json(status: number, body: unknown): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } })
}

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") return json(405, { error: "Method not allowed." })

  const ip = context.ip || "unknown"
  const limit = consumeRateLimit(`content-publish:${ip}`, 10, 15 * 60_000)
  if (!limit.allowed) return json(429, { error: "Too many requests." })

  const auth = await requireSuperAdmin()
  if (!auth.ok) return auth.response
  if (!hasPermission(auth.roles, "approve_publishing")) {
    return json(403, { error: "forbidden", message: "Publishing approval requires super_admin." })
  }

  const gh = githubConfig()
  if (!gh.ok) return json(503, { error: gh.message, code: "github_token_missing" })

  const body = (await req.json()) as { draftId?: string; content?: unknown; message?: string }
  let content = body.content
  if (body.draftId) {
    const safe = body.draftId.replace(/[^a-zA-Z0-9_-]/g, "")
    const draftFile = await getFileContent(gh, `${DRAFTS_PREFIX}${safe}.json`)
    if (!draftFile.ok) return json(404, { error: "Draft not found." })
    const parsed = JSON.parse(draftFile.content) as { content?: unknown }
    content = parsed.content
  }

  const issues = validateSiteContent(content)
  if (issues.length) return json(400, { error: "validation_failed", issues })
  parseSiteContent(content)

  const published = await getFileContent(gh, PUBLISHED_PATH)
  const next = `${JSON.stringify(content, null, 2)}\n`
  const saved = await putFileContent(
    gh,
    PUBLISHED_PATH,
    next,
    body.message || `content: publish approved site content`,
    published.ok ? published.sha : undefined,
  )
  if (!saved.ok) return json(400, { error: saved.message })

  return json(200, {
    ok: true,
    status: "published",
    commitSha: saved.commitSha,
    path: PUBLISHED_PATH,
    note: "Netlify will deploy from the GitHub commit. Draft remains until deleted; live site updates after deploy.",
  })
}

export const config: Config = {
  path: "/api/content/publish",
  method: ["POST"],
}
