import type { Config, Context } from "@netlify/functions"
import { draftRecordStatus } from "../../src/lib/content/pageEditor.ts"
import { parseSiteContent, validateSiteContent } from "../../src/lib/content/siteContent.ts"
import { DRAFTS_PREFIX, getFileContent, githubConfig, listDraftFiles, putFileContent } from "./_shared/githubContent.ts"
import { hasPermission } from "./_shared/permissions.ts"
import { requireEnabledStaffAuth } from "./_shared/requireAuth.ts"
import { consumeRateLimit } from "./_shared/rateLimit.ts"

function json(status: number, body: unknown): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } })
}

export default async (req: Request, context: Context) => {
  const ip = context.ip || "unknown"
  const limit = consumeRateLimit(`content-drafts:${ip}`, 40, 60_000)
  if (!limit.allowed) return json(429, { error: "Too many requests." })

  const gh = githubConfig()
  if (!gh.ok) return json(503, { error: gh.message, code: "github_token_missing" })

  if (req.method === "GET") {
    const auth = await requireEnabledStaffAuth()
    if (!auth.ok) return auth.response
    if (
      !hasPermission(auth.roles, "edit_public_content") &&
      !hasPermission(auth.roles, "propose_tournament_updates") &&
      !hasPermission(auth.roles, "propose_announcements") &&
      !hasPermission(auth.roles, "edit_coaching_info") &&
      !hasPermission(auth.roles, "edit_scheduling_ops")
    ) {
      return json(403, { error: "forbidden" })
    }

    const url = new URL(req.url)
    const id = url.searchParams.get("id")
    if (id) {
      const safe = id.replace(/[^a-zA-Z0-9_-]/g, "")
      const file = await getFileContent(gh, `${DRAFTS_PREFIX}${safe}.json`)
      if (!file.ok) return json(file.status === 404 ? 404 : 400, { error: file.message })
      return json(200, { id: safe, draft: JSON.parse(file.content), sha: file.sha, status: "draft" })
    }

    const listed = await listDraftFiles(gh)
    if (!listed.ok) return json(400, { error: listed.message })
    return json(200, {
      drafts: listed.files.map((file) => ({
        id: file.name.replace(/\.json$/, ""),
        path: file.path,
        status: "draft",
      })),
    })
  }

  if (req.method === "POST") {
    const auth = await requireEnabledStaffAuth()
    if (!auth.ok) return auth.response
    const canSave =
      hasPermission(auth.roles, "edit_public_content") ||
      hasPermission(auth.roles, "propose_tournament_updates") ||
      hasPermission(auth.roles, "propose_announcements") ||
      hasPermission(auth.roles, "edit_coaching_info") ||
      hasPermission(auth.roles, "edit_scheduling_ops")
    if (!canSave) return json(403, { error: "forbidden" })

    const body = (await req.json()) as { id?: string; content?: unknown; message?: string; submitForApproval?: boolean }
    const id = (body.id || `draft-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, "")
    const issues = validateSiteContent(body.content)
    if (issues.length) return json(400, { error: "validation_failed", issues })
    parseSiteContent(body.content)
    const status = draftRecordStatus(body.submitForApproval === true)

    const path = `${DRAFTS_PREFIX}${id}.json`
    const existing = await getFileContent(gh, path)
    const payload = JSON.stringify(
      {
        status,
        updatedAt: new Date().toISOString(),
        updatedBy: auth.email,
        content: body.content,
      },
      null,
      2,
    )
    const saved = await putFileContent(
      gh,
      path,
      `${payload}\n`,
      body.message || `content: save draft ${id}`,
      existing.ok ? existing.sha : undefined,
    )
    if (!saved.ok) return json(400, { error: saved.message })
    return json(200, { ok: true, id, commitSha: saved.commitSha, status })
  }

  return json(405, { error: "Method not allowed." })
}

export const config: Config = {
  path: "/api/content/drafts",
  method: ["GET", "POST"],
}
