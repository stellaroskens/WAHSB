import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { describe, it } from "node:test"
import { draftRequestBody, editField, failureMessage, publishRequestBody } from "../src/lib/content/pageEditor.ts"
import { contentWriteTarget, githubWriteResult } from "../src/lib/content/publishTarget.ts"
import { parseSiteContent } from "../src/lib/content/siteContent.ts"

const content = parseSiteContent(
  JSON.parse(readFileSync(new URL("../src/content/published/siteContent.json", import.meta.url), "utf8")),
)

describe("preview publishing target", () => {
  it("writes a deploy preview only to its own branch", () => {
    const target = contentWriteTarget({
      context: "deploy-preview",
      deployBranch: "cursor/portal-visual",
      owner: undefined,
      repo: undefined,
    })
    assert.equal(target.ok, true)
    if (target.ok) {
      assert.equal(target.owner, "stellaroskens")
      assert.equal(target.repo, "WAHSB")
      assert.equal(target.branch, "cursor/portal-visual")
    }
  })

  it("refuses production, main, another repository, and a missing review branch", () => {
    assert.equal(contentWriteTarget({ context: "production", deployBranch: "main", owner: "stellaroskens", repo: "WAHSB" }).ok, false)
    assert.equal(contentWriteTarget({ context: "deploy-preview", deployBranch: "main", owner: "stellaroskens", repo: "WAHSB" }).ok, false)
    assert.equal(contentWriteTarget({ context: "deploy-preview", deployBranch: "master", owner: "stellaroskens", repo: "WAHSB" }).ok, false)
    assert.equal(contentWriteTarget({ context: "deploy-preview", deployBranch: "../main", owner: "stellaroskens", repo: "WAHSB" }).ok, false)
    assert.equal(contentWriteTarget({ context: "", deployBranch: "cursor/portal-visual", owner: "stellaroskens", repo: "WAHSB" }).ok, false)
    const otherRepo = contentWriteTarget({
      context: "deploy-preview",
      deployBranch: "cursor/portal-visual",
      owner: "someone-else",
      repo: "WAHSB",
    })
    assert.equal(otherRepo.ok, false)
    if (!otherRepo.ok) assert.equal(otherRepo.code, "repository_rejected")
    const production = contentWriteTarget({ context: "production", deployBranch: "main", owner: undefined, repo: undefined })
    assert.equal(production.ok, false)
    if (!production.ok) assert.equal(production.code, "production_write_blocked")
  })

  it("keeps fictional draft copy off the live branch and out of the browser request", () => {
    const edited = editField(content, "pageBodies.home.hero.heading", "Fictional preview headline")
    const draft = draftRequestBody("phase-1-draft", edited, false)
    const publish = publishRequestBody(edited)
    assert.equal(draft.content.pageBodies.home.hero.heading, "Fictional preview headline")
    assert.equal("branch" in draft, false)
    assert.equal("owner" in draft, false)
    assert.equal("repo" in draft, false)
    assert.equal("branch" in publish, false)
    assert.equal(publish.content.pageBodies.home.hero.heading, "Fictional preview headline")
    assert.doesNotMatch(JSON.stringify(draft), /ghp_|github_pat_/)
  })

  it("turns mocked GitHub failures into safe messages", () => {
    const saved = githubWriteResult(201, "abc1234")
    assert.equal(saved.ok, true)
    const unconfirmed = githubWriteResult(201, undefined)
    assert.equal(unconfirmed.ok, false)
    const conflict = githubWriteResult(409, undefined)
    assert.equal(conflict.ok, false)
    if (!conflict.ok) {
      assert.equal(conflict.code, "github_conflict")
      assert.doesNotMatch(conflict.message, /ghp_|github_pat_|Bearer/)
    }
    const expired = githubWriteResult(401, undefined)
    assert.equal(expired.ok, false)
    if (!expired.ok) assert.equal(expired.code, "github_token_rejected")
    const shown = failureMessage(409, { code: "github_conflict", error: "GitHub has a newer copy. ghp_secretvalue" })
    assert.match(shown, /newer copy/)
    assert.doesNotMatch(shown, /ghp_/)
    const blocked = failureMessage(409, { code: "production_write_blocked", error: "Nothing was saved." })
    assert.match(blocked, /unchanged/)
  })

  it("keeps server writes on the review target and preview actions local", () => {
    const publish = readFileSync(new URL("../netlify/functions/content-publish.ts", import.meta.url), "utf8")
    const drafts = readFileSync(new URL("../netlify/functions/content-drafts.ts", import.meta.url), "utf8")
    const github = readFileSync(new URL("../netlify/functions/_shared/githubContent.ts", import.meta.url), "utf8")
    const editor = readFileSync(new URL("../src/pages/admin/AdminContent.tsx", import.meta.url), "utf8")
    assert.match(publish, /requireSuperAdmin/)
    assert.match(publish, /approve_publishing/)
    assert.match(publish, /githubConfig\(\)/)
    assert.doesNotMatch(publish, /body\.branch/)
    assert.match(drafts, /requireEnabledStaffAuth/)
    assert.match(drafts, /DRAFTS_PREFIX/)
    assert.doesNotMatch(drafts, /PUBLISHED_PATH/)
    assert.doesNotMatch(drafts, /body\.branch/)
    assert.match(github, /contentWriteTarget/)
    assert.doesNotMatch(github, /GITHUB_CONTENT_BRANCH/)
    assert.doesNotMatch(github, /\|\| "main"/)
    assert.doesNotMatch(github, /console\./)
    assert.match(editor, /label="Preview"[\s\S]{0,220}setPreviewing\(true\)/)
    assert.match(editor, /label="Review changes"[\s\S]{0,220}setReviewing\(true\)/)
    assert.match(editor, /The live production site stays unchanged/)
  })
})
