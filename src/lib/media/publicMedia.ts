export const MAX_IMAGE_BYTES = 1_500_000

export const IMAGE_TYPES = {
  jpeg: { contentType: "image/jpeg", extension: "jpg" },
  png: { contentType: "image/png", extension: "png" },
  webp: { contentType: "image/webp", extension: "webp" },
  gif: { contentType: "image/gif", extension: "gif" },
  avif: { contentType: "image/avif", extension: "avif" },
} as const

export type ImageKind = keyof typeof IMAGE_TYPES

export const MEDIA_ROLES = ["homepage", "coach-portrait", "fundraiser", "sponsor-logo", "page-image"] as const
export type MediaRole = (typeof MEDIA_ROLES)[number]

export const MEDIA_PLACEMENTS = [
  "home-hero",
  "home-card-practices",
  "home-card-gear",
  "home-card-tournaments",
  "coach:cliff-meredith",
  "coach:chris-breshears",
  "fundraiser:burgerville",
  "fundraiser:panda-express",
  "lakeshore-logo",
] as const
export type MediaPlacement = (typeof MEDIA_PLACEMENTS)[number]

export const OBJECT_POSITIONS = ["center", "center top", "center 42%", "left center", "right center"] as const

export type MediaItem = {
  id: string
  path: string
  repoPath: string
  alt: string
  caption: string
  role: MediaRole
  placement: MediaPlacement | null
  objectPosition: (typeof OBJECT_POSITIONS)[number]
  contentType: string
  bytes: number
}

const BLOCKED = /(student|family|private|bowler|guardian|consent|secret)/i

export function mediaBranchDecision(
  context: string | undefined,
  branch: string | undefined,
): { ok: true; branch: string } | { ok: false; message: string } {
  if (context === "production" || branch === "main") {
    return {
      ok: false,
      message: "Image publishing is turned off for the production site. Use the review preview so main stays unchanged.",
    }
  }
  if (!branch || !/^[A-Za-z0-9._/-]{1,80}$/.test(branch) || branch.includes("..")) {
    return {
      ok: false,
      message: "This site is not running as a review branch, so the image was not saved.",
    }
  }
  return { ok: true, branch }
}

export function detectImageType(bytes: Uint8Array): ImageKind | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg"
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png"
  if (bytes.length >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return "gif"
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "webp"
  }
  if (bytes.length >= 12) {
    const brand = new TextDecoder().decode(bytes.slice(4, 12))
    if (brand.startsWith("ftypavif") || brand.startsWith("ftypavis")) return "avif"
  }
  return null
}

export function decodeBase64(value: string): Uint8Array | null {
  const clean = value.trim().replace(/^data:[^,]+,/, "")
  if (!clean || clean.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(clean)) return null
  const table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
  const bytes = new Uint8Array((clean.length / 4) * 3)
  let written = 0
  for (let index = 0; index < clean.length; index += 4) {
    const a = table.indexOf(clean[index])
    const b = table.indexOf(clean[index + 1])
    const c = clean[index + 2] === "=" ? -1 : table.indexOf(clean[index + 2])
    const d = clean[index + 3] === "=" ? -1 : table.indexOf(clean[index + 3])
    if (a < 0 || b < 0 || (c < 0 && clean[index + 2] !== "=") || (d < 0 && clean[index + 3] !== "=")) return null
    bytes[written] = (a << 2) | (b >> 4)
    written += 1
    if (c >= 0) {
      bytes[written] = ((b & 15) << 4) | (c >> 2)
      written += 1
    }
    if (d >= 0 && c >= 0) {
      bytes[written] = ((c & 3) << 6) | d
      written += 1
    }
  }
  return written ? bytes.slice(0, written) : null
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
}

export function validatePublicImage(input: {
  bytes: Uint8Array
  filename: string
  alt: string
  caption?: string
  role: string
  placement?: string | null
  objectPosition?: string
  existingIds?: string[]
}): { ok: true; item: MediaItem } | { ok: false; message: string } {
  if (input.bytes.byteLength < 32) return { ok: false, message: "That file is empty or too small to be an image." }
  if (input.bytes.byteLength > MAX_IMAGE_BYTES) {
    return { ok: false, message: "Use an image of 1.5 MB or smaller. Larger files are not accepted through the publishing function." }
  }
  const kind = detectImageType(input.bytes)
  if (!kind) return { ok: false, message: "Use a JPEG, PNG, WebP, GIF, or AVIF image. SVG and other files are not accepted." }
  if (input.filename.includes("..") || input.filename.includes("/") || input.filename.includes("\\")) {
    return { ok: false, message: "Use a file name without a folder." }
  }
  const id = slug(input.filename)
  if (!/^[a-z0-9-]{2,40}$/.test(id) || BLOCKED.test(id) || BLOCKED.test(input.filename)) {
    return { ok: false, message: "Use a public image name. Student, family, and private files are not accepted here." }
  }
  if ((input.existingIds ?? []).includes(id)) return { ok: false, message: "An image with that name is already in the library. Replace it instead of adding a second copy." }
  const alt = input.alt.trim()
  if (!alt || alt.length > 180 || /[<>]/.test(alt)) return { ok: false, message: "Add a short description of the image. HTML is not allowed." }
  const caption = (input.caption ?? "").trim()
  if (caption.length > 240 || /[<>]/.test(caption)) return { ok: false, message: "Use a caption of 240 characters or fewer, without HTML." }
  if (!MEDIA_ROLES.includes(input.role as MediaRole)) return { ok: false, message: "Choose a public image use. Private photos are not a choice." }
  const placement = input.placement ? input.placement : null
  if (placement && !MEDIA_PLACEMENTS.includes(placement as MediaPlacement)) {
    return { ok: false, message: "Choose one of the listed page positions." }
  }
  const objectPosition = input.objectPosition || "center"
  if (!OBJECT_POSITIONS.includes(objectPosition as (typeof OBJECT_POSITIONS)[number])) {
    return { ok: false, message: "Choose a listed crop position." }
  }
  const extension = IMAGE_TYPES[kind].extension
  const repoPath = `public/media/library/${id}.${extension}`
  if (!isLibraryRepoPath(repoPath)) return { ok: false, message: "That file location is not allowed." }
  return {
    ok: true,
    item: {
      id,
      path: `/${repoPath.slice("public/".length)}`,
      repoPath,
      alt,
      caption,
      role: input.role as MediaRole,
      placement: placement as MediaPlacement | null,
      objectPosition: objectPosition as MediaItem["objectPosition"],
      contentType: IMAGE_TYPES[kind].contentType,
      bytes: input.bytes.byteLength,
    },
  }
}

export function isLibraryRepoPath(path: string): boolean {
  return /^public\/media\/library\/[a-z0-9-]+\.(jpg|png|webp|gif|avif)$/.test(path)
}

export function isProtectedPublicPath(path: string): boolean {
  return !isLibraryRepoPath(path)
}

export function assignPlacement(items: MediaItem[], id: string, placement: MediaPlacement | null): MediaItem[] {
  return items.map((item) => {
    if (item.id === id) return { ...item, placement }
    if (placement && item.placement === placement) return { ...item, placement: null }
    return item
  })
}

export function imageForPlacement(items: MediaItem[], placement: string): MediaItem | null {
  return items.find((item) => item.placement === placement) ?? null
}

export function parseMediaCatalog(value: unknown): MediaItem[] {
  if (!value || typeof value !== "object" || !("items" in value) || !Array.isArray(value.items)) return []
  return value.items.flatMap((item) => {
    if (!item || typeof item !== "object") return []
    const record = item as MediaItem
    if (!isLibraryRepoPath(record.repoPath) || record.path !== `/${record.repoPath.slice("public/".length)}`) return []
    if (!MEDIA_ROLES.includes(record.role)) return []
    if (record.placement && !MEDIA_PLACEMENTS.includes(record.placement)) return []
    if (!OBJECT_POSITIONS.includes(record.objectPosition)) return []
    if (BLOCKED.test(record.id) || BLOCKED.test(record.alt)) return []
    return [record]
  })
}
