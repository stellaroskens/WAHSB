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
import { deniedResponse, requireSuperAdmin } from "./_shared/requireAuth.ts"
import { consumeRateLimit } from "./_shared/rateLimit.ts"

function json(status: number, body: unknown): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } })
}

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") return json(405, { error: "Method not allowed." })

  const ip = context.ip || "unknown"
  const limit = consumeRateLimit(`content-publish:${ip}`, 10, 15 * 60_000)
  if (!limit.allowed) return json(429, { error: "Too many requests." })

  const auth = await requireSuperAdmin(context)
  if (!auth.ok) return auth.response
  if (!hasPermission(auth.roles, "approve_publishing")) {
    return deniedResponse(403, "Publishing approval requires super_admin.", "forbidden")
  }

  const gh = githubConfig()
  if (!gh.ok) return json(gh.status, { error: gh.message, code: gh.code })

  let body: { draftId?: string; content?: unknown; message?: string }
  try {
    const parsed = await req.json()
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return json(400, { error: "validation_failed" })
    body = parsed as typeof body
  } catch {
    return json(400, { error: "validation_failed" })
  }
  let content = body.content
  if (body.draftId) {
    const safe = body.draftId.replace(/[^a-zA-Z0-9_-]/g, "")
    const draftFile = await getFileContent(gh, `${DRAFTS_PREFIX}${safe}.json`)
    if (!draftFile.ok) return json(draftFile.status, { error: draftFile.message, code: draftFile.code })
    try {
      const parsed = JSON.parse(draftFile.content) as { content?: unknown }
      content = parsed.content
    } catch {
      return json(400, { error: "validation_failed" })
    }
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
  if (!saved.ok) return json(saved.status, { error: saved.message, code: saved.code })

  return json(200, {
    ok: true,
    status: "published",
    commitSha: saved.commitSha,
    path: PUBLISHED_PATH,
    branch: gh.branch,
    note: `Saved on review branch ${gh.branch}. The live production site is unchanged.`,
  })
}

export const config: Config = {
  path: "/api/content/publish",
  method: ["POST"],
}
