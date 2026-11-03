import type { Config, Context } from "@netlify/functions"
import {
  assignPlacement,
  decodeBase64,
  isLibraryRepoPath,
  MEDIA_PLACEMENTS,
  mediaBranchDecision,
  parseMediaCatalog,
  validatePublicImage,
  type MediaItem,
  type MediaPlacement,
} from "../../src/lib/media/publicMedia.ts"
import { deleteRepoFile, getFileContent, githubConfig, putBinaryContent, putFileContent } from "./_shared/githubContent.ts"
import { hasPermission } from "./_shared/permissions.ts"
import { consumeRateLimit } from "./_shared/rateLimit.ts"
import { requireSuperAdmin } from "./_shared/requireAuth.ts"

const CATALOG_PATH = "src/content/published/publicMedia.json"

function json(status: number, body: unknown): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } })
}

async function readCatalog(config: { token: string; owner: string; repo: string; branch: string }) {
  const file = await getFileContent(config, CATALOG_PATH)
  if (!file.ok) return { items: [] as MediaItem[], sha: undefined as string | undefined }
  try {
    return { items: parseMediaCatalog(JSON.parse(file.content)), sha: file.sha }
  } catch {
    return { items: [] as MediaItem[], sha: file.sha }
  }
}

async function writeCatalog(
  config: { token: string; owner: string; repo: string; branch: string },
  items: MediaItem[],
  sha: string | undefined,
  message: string,
) {
  return putFileContent(config, CATALOG_PATH, `${JSON.stringify({ version: 1, items }, null, 2)}\n`, message, sha)
}

export default async (req: Request, context: Context) => {
  if (req.method !== "GET" && req.method !== "POST") return json(405, { error: "Method not allowed." })
  const limit = consumeRateLimit(`public-media:${context.ip || "unknown"}`, 8, 15 * 60_000)
  if (!limit.allowed) return json(429, { error: "Too many requests." })

  const auth = await requireSuperAdmin()
  if (!auth.ok) return auth.response
  if (!hasPermission(auth.roles, "approve_publishing")) {
    return json(403, { error: "forbidden", message: "Only a super administrator can publish public images." })
  }

  const gh = githubConfig()
  const decision = mediaBranchDecision(
    Netlify.env.get("CONTEXT"),
    Netlify.env.get("BRANCH") || Netlify.env.get("GITHUB_CONTENT_BRANCH"),
  )
  if (!gh.ok) {
    return json(503, {
      error: "github_token_missing",
      message: "GitHub publishing is not configured for this deploy. The token stays in Netlify and is not shown here.",
      items: [],
    })
  }
  if (!decision.ok) return json(409, { error: "production_blocked", message: decision.message, items: [] })
  const target = { ...gh, branch: decision.branch }
  const catalog = await readCatalog(target)
  if (req.method === "GET") {
    return json(200, {
      items: catalog.items,
      branch: decision.branch,
      limits: { maxBytes: 1_500_000, types: ["jpeg", "png", "webp", "gif", "avif"] },
    })
  }

  const body = (await req.json()) as {
    action?: string
    id?: string
    filename?: string
    alt?: string
    caption?: string
    role?: string
    placement?: string | null
    objectPosition?: string
    data?: string
  }

  if (body.action === "remove" || body.action === "assign") {
    const current = catalog.items.find((item) => item.id === body.id)
    if (!current || !isLibraryRepoPath(current.repoPath)) return json(400, { error: "That library image was not found." })
    if (body.action === "assign") {
      const placement = body.placement ? body.placement : null
      if (placement && !MEDIA_PLACEMENTS.includes(placement as MediaPlacement)) {
        return json(400, { error: "Choose a listed page position." })
      }
      const items = assignPlacement(catalog.items, current.id, placement as MediaPlacement | null)
      const saved = await writeCatalog(target, items, catalog.sha, `media: place ${current.id}`)
      if (!saved.ok) return json(400, { error: saved.message })
      return json(200, { ok: true, items, commitSha: saved.commitSha, note: "The review preview updates after Netlify deploys this commit. Production was not changed." })
    }
    const existing = await getFileContent(target, current.repoPath)
    if (existing.ok) {
      const removed = await deleteRepoFile(target, current.repoPath, `media: remove ${current.id}`, existing.sha)
      if (!removed.ok) return json(400, { error: removed.message })
    }
    const items = catalog.items.filter((item) => item.id !== current.id)
    const saved = await writeCatalog(target, items, catalog.sha, `media: catalog remove ${current.id}`)
    if (!saved.ok) return json(400, { error: saved.message })
    return json(200, { ok: true, items, note: "The file was removed from the review branch. Production was not changed." })
  }

  if (body.action !== "upload" && body.action !== "replace") return json(400, { error: "Unknown image action." })
  const bytes = decodeBase64(body.data ?? "")
  if (!bytes) return json(400, { error: "The image could not be read." })
  const replacing = body.action === "replace" ? catalog.items.find((item) => item.id === body.id) : undefined
  if (body.action === "replace" && !replacing) return json(400, { error: "That library image was not found." })
  const checked = validatePublicImage({
    bytes,
    filename: replacing ? replacing.id : body.filename || "",
    alt: body.alt || "",
    caption: body.caption,
    role: body.role || "",
    placement: body.placement,
    objectPosition: body.objectPosition,
    existingIds: catalog.items.map((item) => item.id).filter((id) => id !== replacing?.id),
  })
  if (!checked.ok) return json(400, { error: checked.message })
  const prior = await getFileContent(target, checked.item.repoPath)
  if (prior.ok && !replacing) return json(409, { error: "That file already exists. Replace the library image instead." })
  const encoded = Buffer.from(bytes).toString("base64")
  const savedFile = await putBinaryContent(
    target,
    checked.item.repoPath,
    encoded,
    `media: ${body.action} ${checked.item.id}`,
    prior.ok ? prior.sha : undefined,
  )
  if (!savedFile.ok) return json(400, { error: savedFile.message })
  if (replacing && replacing.repoPath !== checked.item.repoPath) {
    const old = await getFileContent(target, replacing.repoPath)
    if (old.ok) await deleteRepoFile(target, replacing.repoPath, `media: replace ${replacing.id}`, old.sha)
  }
  const nextItem = { ...checked.item, id: replacing?.id ?? checked.item.id }
  const without = catalog.items.filter((item) => item.id !== nextItem.id)
  const items = assignPlacement([...without, nextItem], nextItem.id, nextItem.placement)
  const saved = await writeCatalog(target, items, catalog.sha, `media: catalog ${nextItem.id}`)
  if (!saved.ok) return json(400, { error: "The image file was saved, but the media list could not be updated." })
  return json(200, {
    ok: true,
    item: nextItem,
    items,
    commitSha: saved.commitSha,
    note: "The review preview shows this image after Netlify deploys the commit. Production was not changed.",
  })
}

export const config: Config = {
  path: "/api/media",
  method: ["GET", "POST"],
}
