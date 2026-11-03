import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { describe, it } from "node:test"
import {
  MAX_IMAGE_BYTES,
  assignPlacement,
  detectImageType,
  imageForPlacement,
  isLibraryRepoPath,
  isProtectedPublicPath,
  mediaBranchDecision,
  parseMediaCatalog,
  validatePublicImage,
  type MediaItem,
} from "../src/lib/media/publicMedia.ts"

function png(size = 40): Uint8Array {
  const bytes = new Uint8Array(size)
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  return bytes
}

describe("public image publishing", () => {
  it("accepts a real PNG and rejects other files, private names, and oversized images", () => {
    const saved = validatePublicImage({
      bytes: png(),
      filename: "Sponsor Logo.PNG",
      alt: "Local lanes logo",
      caption: "Community supporter",
      role: "sponsor-logo",
      placement: null,
      objectPosition: "center",
    })
    assert.equal(saved.ok, true)
    if (saved.ok) {
      assert.equal(saved.item.repoPath, "public/media/library/sponsor-logo.png")
      assert.equal(saved.item.path, "/media/library/sponsor-logo.png")
      assert.equal(isProtectedPublicPath(saved.item.repoPath), false)
    }
    assert.equal(detectImageType(Uint8Array.from([0x3c, 0x73, 0x76, 0x67])), null)
    assert.equal(validatePublicImage({ bytes: png(), filename: "student-photo.png", alt: "A student", role: "page-image" }).ok, false)
    assert.equal(validatePublicImage({ bytes: png(), filename: "family-night.png", alt: "Family", role: "page-image" }).ok, false)
    assert.equal(validatePublicImage({ bytes: png(), filename: "../brand/logo.png", alt: "Logo", role: "page-image" }).ok, false)
    const huge = png(MAX_IMAGE_BYTES + 1)
    assert.equal(validatePublicImage({ bytes: huge, filename: "large.png", alt: "Large", role: "page-image" }).ok, false)
    assert.equal(isLibraryRepoPath("public/brand/website-logo-480.webp"), false)
    assert.equal(isProtectedPublicPath("public/coaches/cliff-meredith-640.webp"), true)
  })

  it("places one homepage image at a time and ignores unsafe catalog rows", () => {
    const first = validatePublicImage({ bytes: png(), filename: "hero-a.png", alt: "Hero A", role: "homepage", placement: "home-hero" })
    const second = validatePublicImage({ bytes: png(), filename: "hero-b.png", alt: "Hero B", role: "homepage" })
    assert.equal(first.ok && second.ok, true)
    if (!first.ok || !second.ok) return
    const placed = assignPlacement([first.item, second.item], second.item.id, "home-hero")
    assert.equal(imageForPlacement(placed, "home-hero")?.id, "hero-b")
    assert.equal(placed.find((item) => item.id === "hero-a")?.placement, null)
    const unsafe: MediaItem = { ...first.item, repoPath: "public/../../secret.png", path: "/../../secret.png" }
    assert.deepEqual(parseMediaCatalog({ items: [unsafe, second.item] }).map((item) => item.id), ["hero-b"])
  })

  it("does not publish images to production or expose the GitHub token", () => {
    assert.equal(mediaBranchDecision("production", "main").ok, false)
    assert.equal(mediaBranchDecision("deploy-preview", "main").ok, false)
    assert.equal(mediaBranchDecision("deploy-preview", "cursor/portal-visual").ok, true)
    const source = readFileSync(new URL("../netlify/functions/public-media.ts", import.meta.url), "utf8")
    assert.match(source, /requireSuperAdmin/)
    assert.match(source, /putBinaryContent/)
    assert.doesNotMatch(source, /GITHUB_CONTENT_TOKEN/)
    assert.doesNotMatch(source, /Authorization/)
    const page = readFileSync(new URL("../src/pages/admin/AdminMedia.tsx", import.meta.url), "utf8")
    assert.match(page, /\/api\/media/)
    assert.doesNotMatch(page, /api\.github\.com/)
    const home = readFileSync(new URL("../src/pages/HomeReview.tsx", import.meta.url), "utf8")
    assert.match(home, /homeHeroImage/)
  })
})
