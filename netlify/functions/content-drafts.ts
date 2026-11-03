import type { Config, Context } from "@netlify/functions"
import { draftRecordStatus } from "../../src/lib/content/pageEditor.ts"
import { parseSiteContent, validateSiteContent } from "../../src/lib/content/siteContent.ts"
import { DRAFTS_PREFIX, getFileContent, githubConfig, listDraftFiles, putFileContent } from "./_shared/githubContent.ts"
import { mayEditSiteDrafts } from "./_shared/permissions.ts"
import { deniedResponse, requireEnabledStaffAuth } from "./_shared/requireAuth.ts"
import { consumeRateLimit } from "./_shared/rateLimit.ts"

function json(status: number, body: unknown): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } })
}

export default async (req: Request, context: Context) => {
  const ip = context.ip || "unknown"
  const limit = consumeRateLimit(`content-drafts:${ip}`, 40, 60_000)
  if (!limit.allowed) return json(429, { error: "Too many requests." })

  if (req.method === "GET") {
    const auth = await requireEnabledStaffAuth(context)
    if (!auth.ok) return auth.response
    if (!mayEditSiteDrafts(auth.roles)) return deniedResponse(403, "Staff role required.", "forbidden")

    const gh = githubConfig()
    if (!gh.ok) return json(gh.status, { error: gh.message, code: gh.code })

    const url = new URL(req.url)
    const id = url.searchParams.get("id")
    if (id) {
      const safe = id.replace(/[^a-zA-Z0-9_-]/g, "")
      const file = await getFileContent(gh, `${DRAFTS_PREFIX}${safe}.json`)
      if (!file.ok) return json(file.status, { error: file.message, code: file.code })
      let draft: unknown
      try {
        draft = JSON.parse(file.content)
      } catch {
        return json(400, { error: "validation_failed" })
      }
      return json(200, { id: safe, draft, sha: file.sha, status: "draft" })
    }

    const listed = await listDraftFiles(gh)
    if (!listed.ok) return json(listed.status, { error: listed.message, code: listed.code })
    return json(200, {
      drafts: listed.files.map((file) => ({
        id: file.name.replace(/\.json$/, ""),
        path: file.path,
        status: "draft",
      })),
    })
  }

  if (req.method === "POST") {
    const auth = await requireEnabledStaffAuth(context)
    if (!auth.ok) return auth.response
    if (!mayEditSiteDrafts(auth.roles)) return deniedResponse(403, "Staff role required.", "forbidden")

    const gh = githubConfig()
    if (!gh.ok) return json(gh.status, { error: gh.message, code: gh.code })

    let body: { id?: string; content?: unknown; message?: string; submitForApproval?: boolean }
    try {
      const parsed = await req.json()
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return json(400, { error: "validation_failed" })
      body = parsed as typeof body
    } catch {
      return json(400, { error: "validation_failed" })
    }
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
    if (!saved.ok) return json(saved.status, { error: saved.message, code: saved.code })
    return json(200, {
      ok: true,
      id,
      commitSha: saved.commitSha,
      status,
      branch: gh.branch,
      note: "Draft saved on the review branch. Public production content was not changed.",
    })
  }

  return json(405, { error: "Method not allowed." })
}

export const config: Config = {
  path: "/api/content/drafts",
  method: ["GET", "POST"],
}
