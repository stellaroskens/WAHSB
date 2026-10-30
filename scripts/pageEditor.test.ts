import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { describe, it } from "node:test"
import {
  DRAFT_PREVIEW_LABEL,
  EDITOR_PAGES,
  GITHUB_SETUP_STEPS,
  contentFromDraftPayload,
  draftRecordStatus,
  draftRequestBody,
  editField,
  failureMessage,
  prepareContentForSave,
  publishRequestBody,
  successMessage,
} from "../src/lib/content/pageEditor.ts"
import { parseSiteContent, validateSiteContent } from "../src/lib/content/siteContent.ts"

const published = JSON.parse(
  readFileSync(new URL("../src/content/published/siteContent.json", import.meta.url), "utf8"),
) as unknown

const content = parseSiteContent(published)

describe("visual page editor", () => {
  it("loads the published homepage, club, and team gear copy", () => {
    assert.equal(validateSiteContent(published).length, 0)
    assert.equal(content.pageBodies.home.hero.heading, "Strike up support for our bowlers.")
    assert.equal(content.pageBodies.teamGear.leadBeforeShopName, "We're moving our team gear shopping experience to")
    assert.equal(content.coaches[0].name, "Cliff Meredith")
    assert.equal(content.coaches[1].name, "Chris Breshears")
    assert.equal(content.pageBodies.club.administratorName, "Maranda Fisher")
    assert.equal(content.practiceLocation.name, "Lakeshore Lanes")
  })

  it("lists every public route", () => {
    const routes = EDITOR_PAGES.map((page) => page.route)
    for (const route of [
      "/",
      "/our-club",
      "/practices",
      "/tournaments",
      "/sponsors",
      "/sponsor-qr",
      "/fundraisers",
      "/resources",
      "/volunteer",
      "/contact",
      "/faq",
      "/bowl-a-thon",
      "/team-gear",
      "/sign-in",
      "/family",
    ]) {
      assert.ok(routes.includes(route), route)
    }
    assert.ok(EDITOR_PAGES.some((page) => page.id === "coaches"))
  })

  it("changes one field without rewriting other content", () => {
    const next = editField(content, "pageBodies.home.hero.heading", "A new heading")
    assert.equal(next.pageBodies.home.hero.heading, "A new heading")
    assert.equal(next.pageBodies.home.hero.description, content.pageBodies.home.hero.description)
    assert.deepEqual(next.coaches, content.coaches)
    assert.deepEqual(next.fundraisers, content.fundraisers)
    assert.deepEqual(next.practiceTournaments, content.practiceTournaments)
    assert.equal(next.pageBodies.teamGear.heading, content.pageBodies.teamGear.heading)
  })

  it("rejects markup, insecure links, and unknown fields", () => {
    const broken = editField(content, "pageBodies.home.hero.heading", "<script>alert(1)</script>")
    assert.ok(validateSiteContent(broken).some((issue) => issue.message.includes("HTML")))
    const link = editField(content, "teamGearShop.url", "http://example.com")
    assert.ok(validateSiteContent(link).some((issue) => issue.path === "teamGearShop.url"))
    assert.throws(() => editField(content, "coaches.0.email", "person@example.com"))
  })

  it("keeps an empty team store link unset", () => {
    const next = prepareContentForSave(editField(content, "teamGearShop.teamStoreUrl", "   "))
    assert.equal(next.teamGearShop.teamStoreUrl, null)
    assert.equal(validateSiteContent(next).length, 0)
  })

  it("reloads a saved draft and refuses a draft that does not match", () => {
    const edited = editField(content, "pageBodies.club.heroTitle", "Our Club today")
    const loaded = contentFromDraftPayload({ draft: { status: "pending_approval", content: edited } })
    assert.equal(loaded.ok, true)
    if (loaded.ok) {
      assert.equal(loaded.status, "pending_approval")
      assert.equal(loaded.content.pageBodies.club.heroTitle, "Our Club today")
      assert.equal(loaded.content.pageBodies.home.hero.heading, content.pageBodies.home.hero.heading)
    }
    const rejected = contentFromDraftPayload({ draft: { content: { version: 1 } } })
    assert.equal(rejected.ok, false)
  })

  it("sends drafts and publication without a draft id on publish", () => {
    const draft = draftRequestBody("working-draft", content, true)
    assert.equal(draft.submitForApproval, true)
    assert.equal(draftRecordStatus(true), "pending_approval")
    assert.equal(draftRecordStatus(false), "draft")
    const publish = publishRequestBody(content)
    assert.equal("draftId" in publish, false)
    assert.equal(publish.content.pageBodies.home.hero.heading, content.pageBodies.home.hero.heading)
  })

  it("does not report success when GitHub returns no commit", () => {
    assert.equal(successMessage("publish", {}), null)
    const missing = failureMessage(503, {
      code: "github_token_missing",
      error: "GitHub content token is not configured.",
    })
    assert.match(missing, /Nothing was saved/)
    assert.doesNotMatch(missing, /ghp_|github_pat_/)
    assert.equal(DRAFT_PREVIEW_LABEL, "DRAFT PREVIEW — NOT PUBLISHED")
  })

  it("keeps publishing on the server and the public pages on the content file", () => {
    const publish = readFileSync(new URL("../netlify/functions/content-publish.ts", import.meta.url), "utf8")
    const drafts = readFileSync(new URL("../netlify/functions/content-drafts.ts", import.meta.url), "utf8")
    const editor = readFileSync(new URL("../src/pages/admin/AdminContent.tsx", import.meta.url), "utf8")
    const home = readFileSync(new URL("../src/pages/HomeReview.tsx", import.meta.url), "utf8")
    const rollback = readFileSync(new URL("../src/pages/Home.tsx", import.meta.url), "utf8")
    const club = readFileSync(new URL("../src/pages/OurClub.tsx", import.meta.url), "utf8")
    const gear = readFileSync(new URL("../src/pages/TeamGear.tsx", import.meta.url), "utf8")
    assert.match(publish, /requireSuperAdmin/)
    assert.match(publish, /approve_publishing/)
    assert.match(drafts, /draftRecordStatus/)
    assert.match(editor, /DRAFT_PREVIEW_LABEL/)
    assert.match(editor, /Advanced: raw content file/)
    assert.doesNotMatch(editor, /Content JSON/)
    assert.match(home, /pageBodies\.home\.hero\.heading/)
    assert.match(club, /pageBodies\.club\.heroTitle/)
    assert.match(gear, /pageBodies\.teamGear\.heading/)
    assert.equal(rollback.includes("pageBodies"), false)
    assert.ok(GITHUB_SETUP_STEPS.some((step) => step.includes("Fine-grained")))
    assert.ok(GITHUB_SETUP_STEPS.some((step) => step.includes("Contents")))
  })
})
