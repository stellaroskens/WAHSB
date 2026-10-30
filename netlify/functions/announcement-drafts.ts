import type { Config, Context } from "@netlify/functions"
import { announcementRecordStatus, validateAnnouncementDraft } from "../../src/lib/content/announcementDraft.ts"
import { DRAFTS_PREFIX, getFileContent, githubConfig, listDraftFiles, putFileContent } from "./_shared/githubContent.ts"
import { hasPermission } from "./_shared/permissions.ts"
import { requireSuperAdmin } from "./_shared/requireAuth.ts"
import { consumeRateLimit } from "./_shared/rateLimit.ts"

const PREFIX = `${DRAFTS_PREFIX}announcement-`

function json(status: number, body: unknown): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } })
}

export default async (req: Request, context: Context) => {
  const limit = consumeRateLimit(`announcements:${context.ip || "unknown"}`, 30, 60_000)
  if (!limit.allowed) return json(429, { error: "Too many requests." })

  const auth = await requireSuperAdmin()
  if (!auth.ok) return auth.response
  if (!hasPermission(auth.roles, "propose_announcements") && !hasPermission(auth.roles, "approve_publishing")) {
    return json(403, { error: "forbidden" })
  }

  const gh = githubConfig()
  if (!gh.ok) return json(503, { error: gh.message, code: "github_token_missing" })

  if (req.method === "GET") {
    const id = new URL(req.url).searchParams.get("id")
    if (!id) {
      const listed = await listDraftFiles({ ...gh, branch: gh.branch })
      if (!listed.ok) return json(400, { error: listed.message })
      return json(200, {
        drafts: listed.files
          .filter((file) => file.name.startsWith("announcement-") && file.name.endsWith(".json"))
          .map((file) => ({ id: file.name.replace(/^announcement-/, "").replace(/\.json$/, ""), status: "saved" })),
        sending: "disabled",
      })
    }
    const safe = id.replace(/[^a-zA-Z0-9_-]/g, "")
    const file = await getFileContent(gh, `${PREFIX}${safe}.json`)
    if (!file.ok) return json(file.status === 404 ? 404 : 400, { error: "Draft not found." })
    return json(200, { id: safe, draft: JSON.parse(file.content), sending: "disabled" })
  }

  if (req.method === "POST") {
    const body = (await req.json()) as { id?: string; draft?: unknown; submitForApproval?: boolean }
    const checked = validateAnnouncementDraft(body.draft)
    if (!checked.ok) return json(400, { error: checked.message })
    const id = (body.id || "announcement-draft").replace(/[^a-zA-Z0-9_-]/g, "")
    const status = announcementRecordStatus(body.submitForApproval === true)
    const path = `${PREFIX}${id}.json`
    const existing = await getFileContent(gh, path)
    const payload = JSON.stringify(
      { status, updatedAt: new Date().toISOString(), updatedBy: auth.email, draft: checked.draft },
      null,
      2,
    )
    const saved = await putFileContent(
      gh,
      path,
      `${payload}\n`,
      `content: save announcement draft ${id}`,
      existing.ok ? existing.sha : undefined,
    )
    if (!saved.ok) return json(400, { error: saved.message })
    return json(200, { ok: true, id, status, commitSha: saved.commitSha, sending: "disabled" })
  }

  return json(405, { error: "Method not allowed. Announcements cannot be sent from this site." })
}

export const config: Config = {
  path: "/api/admin/announcements",
  method: ["GET", "POST"],
}
