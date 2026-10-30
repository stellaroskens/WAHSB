import type { Config, Context } from "@netlify/functions"
import { parseSiteContent, validateSiteContent } from "../../src/lib/content/siteContent.ts"
import { getFileContent, githubConfig, listPathCommits, PUBLISHED_PATH } from "./_shared/githubContent.ts"
import { requireSuperAdmin } from "./_shared/requireAuth.ts"

function json(status: number, body: unknown): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } })
}

export default async (req: Request, _context: Context) => {
  if (req.method !== "GET") return json(405, { error: "Method not allowed." })

  const auth = await requireSuperAdmin()
  if (!auth.ok) return auth.response

  const gh = githubConfig()
  if (!gh.ok) return json(503, { error: gh.message, code: "github_token_missing" })

  const sha = new URL(req.url).searchParams.get("sha")
  if (sha) {
    if (!/^[a-f0-9]{7,40}$/i.test(sha)) return json(400, { error: "That version id is not valid." })
    const file = await getFileContent(gh, PUBLISHED_PATH, sha)
    if (!file.ok) return json(file.status === 404 ? 404 : 400, { error: "That version could not be read." })
    let content: unknown
    try {
      content = JSON.parse(file.content)
    } catch {
      return json(400, { error: "That version is not readable content." })
    }
    const issues = validateSiteContent(content)
    if (issues.length) return json(400, { error: "That version does not match the current pages, so it was not loaded.", issues })
    parseSiteContent(content)
    return json(200, { sha, content, status: "historical" })
  }

  const listed = await listPathCommits(gh, PUBLISHED_PATH)
  if (!listed.ok) return json(400, { error: listed.message })
  return json(200, { commits: listed.commits, status: "history" })
}

export const config: Config = {
  path: "/api/content/history",
  method: ["GET"],
}
