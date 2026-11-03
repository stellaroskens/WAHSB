import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { mkdtempSync, readFileSync, readdirSync, statSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { describe, it } from "node:test"
import { fileURLToPath } from "node:url"
import { draftRequestBody, editField, failureMessage, publishRequestBody } from "../src/lib/content/pageEditor.ts"
import {
  contentWriteTarget,
  githubWriteResult,
  mergeDeployMetadata,
  metadataFromCapture,
  reviewDraftPath,
} from "../src/lib/content/publishTarget.ts"
import { parseSiteContent } from "../src/lib/content/siteContent.ts"

const content = parseSiteContent(
  JSON.parse(readFileSync(new URL("../src/content/published/siteContent.json", import.meta.url), "utf8")),
)

describe("preview publishing target", () => {
  it("writes a deploy preview only to its own branch", () => {
    const target = contentWriteTarget({
      context: "deploy-preview",
      deployBranch: "cursor/portal-visual",
      pullRequest: "true",
      reviewId: "17",
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

  it("uses the deploy-preview head branch when the deploy branch is main", () => {
    const target = contentWriteTarget({
      context: "deploy-preview",
      deployBranch: "main",
      headBranch: "cursor/portal-visual",
      pullRequest: "17",
      owner: "stellaroskens",
      repo: "WAHSB",
    })
    assert.equal(target.ok, true)
    if (target.ok) assert.equal(target.branch, "cursor/portal-visual")
    const fromPull = contentWriteTarget({
      context: undefined,
      deployBranch: undefined,
      headBranch: "cursor/portal-visual",
      pullRequest: "17",
      owner: undefined,
      repo: undefined,
    })
    assert.equal(fromPull.ok, true)
    if (fromPull.ok) assert.equal(fromPull.branch, "cursor/portal-visual")
    const fromReview = contentWriteTarget({
      context: undefined,
      deployBranch: "refs/heads/cursor/portal-visual",
      reviewId: "17",
      owner: undefined,
      repo: undefined,
    })
    assert.equal(fromReview.ok, true)
    if (fromReview.ok) assert.equal(fromReview.branch, "cursor/portal-visual")
    const productionHead = contentWriteTarget({
      context: "production",
      deployBranch: "main",
      headBranch: "cursor/portal-visual",
      owner: "stellaroskens",
      repo: "WAHSB",
    })
    assert.equal(productionHead.ok, false)
    if (!productionHead.ok) assert.equal(productionHead.code, "production_write_blocked")
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
    assert.match(github, /mergeDeployMetadata/)
    assert.match(github, /metadataFromCapture\(capturedDeployTarget\)/)
    assert.match(github, /serverValue\("HEAD"\)/)
    assert.match(github, /serverValue\("PULL_REQUEST"\)/)
    assert.match(github, /serverValue\("REVIEW_ID"\)/)
    assert.match(github, /process\.env\[name\]/)
    assert.doesNotMatch(github, /process\.env\.GITHUB/)
    assert.doesNotMatch(github, /searchParams\.get\(["']branch/)
    assert.match(drafts, /reviewDraftPath/)
    const buildScript = readFileSync(new URL("../package.json", import.meta.url), "utf8")
    assert.match(buildScript, /scripts\/captureDeployTarget\.mjs/)
    assert.match(github, /github_token_missing/)
    assert.match(drafts, /catch/)
    assert.match(publish, /catch/)
    const announcements = readFileSync(new URL("../netlify/functions/announcement-drafts.ts", import.meta.url), "utf8")
    assert.match(announcements, /catch/)
    assert.match(announcements, /validation_failed/)
    assert.doesNotMatch(github, /GITHUB_CONTENT_BRANCH/)
    assert.doesNotMatch(github, /\|\| "main"/)
    assert.doesNotMatch(github, /console\./)
    assert.match(editor, /label="Preview"[\s\S]{0,220}setPreviewing\(true\)/)
    assert.match(editor, /label="Review changes"[\s\S]{0,220}setReviewing\(true\)/)
    assert.match(editor, /The live production site stays unchanged/)
  })
})

const previewCapture = {
  context: "deploy-preview",
  branch: "pull/17/head",
  head: "cursor/portal-visual",
  pullRequest: "true",
  reviewId: "17",
}

const emptyRuntime = {
  context: undefined,
  deployBranch: undefined,
  headBranch: undefined,
  pullRequest: undefined,
  reviewId: undefined,
}

function targetFrom(runtime: typeof emptyRuntime, captured: unknown) {
  const merged = mergeDeployMetadata(runtime, metadataFromCapture(captured))
  return contentWriteTarget({
    context: merged.context,
    deployBranch: merged.deployBranch,
    headBranch: merged.headBranch,
    pullRequest: merged.pullRequest,
    reviewId: merged.reviewId,
    owner: "stellaroskens",
    repo: "WAHSB",
  })
}

describe("deploy preview branch capture", () => {
  it("saves a fictional draft on cursor/portal-visual under content/drafts when runtime metadata is missing", () => {
    const target = targetFrom(emptyRuntime, previewCapture)
    assert.equal(target.ok, true)
    if (target.ok) {
      assert.equal(target.branch, "cursor/portal-visual")
      assert.equal(target.owner, "stellaroskens")
      assert.equal(target.repo, "WAHSB")
    }
    const draft = reviewDraftPath("fictional-our-club")
    assert.equal(draft.path, "content/drafts/fictional-our-club.json")
    assert.match(draft.path, /^content\/drafts\//)
    assert.doesNotMatch(draft.path, /siteContent\.json|src\/content\/published/)
  })

  it("rejects a deploy preview that is missing review metadata", () => {
    const missing = targetFrom(emptyRuntime, null)
    assert.equal(missing.ok, false)
    if (!missing.ok) assert.equal(missing.code, "preview_branch_required")
    const blank = targetFrom(emptyRuntime, {})
    assert.equal(blank.ok, false)
    const unlabeled = contentWriteTarget({
      context: "deploy-preview",
      deployBranch: "cursor/portal-visual",
      owner: "stellaroskens",
      repo: "WAHSB",
    })
    assert.equal(unlabeled.ok, false)
    if (!unlabeled.ok) assert.equal(unlabeled.code, "preview_branch_required")
  })

  it("blocks production even when the captured branch is the review branch", () => {
    const capturedProduction = targetFrom(emptyRuntime, {
      context: "production",
      branch: "main",
      head: "cursor/portal-visual",
      pullRequest: "true",
      reviewId: "17",
    })
    assert.equal(capturedProduction.ok, false)
    if (!capturedProduction.ok) assert.equal(capturedProduction.code, "production_write_blocked")
    const runtimeProduction = targetFrom(
      { context: "production", deployBranch: "main", headBranch: undefined, pullRequest: undefined, reviewId: undefined },
      previewCapture,
    )
    assert.equal(runtimeProduction.ok, false)
    if (!runtimeProduction.ok) assert.equal(runtimeProduction.code, "production_write_blocked")
  })

  it("refuses main, master, pull checkout refs, and disagreeing branches", () => {
    const checkoutOnly = targetFrom(emptyRuntime, {
      context: "deploy-preview",
      branch: "pull/17/head",
      head: "",
      pullRequest: "true",
      reviewId: "17",
    })
    assert.equal(checkoutOnly.ok, false)
    if (!checkoutOnly.ok) assert.equal(checkoutOnly.code, "preview_branch_required")
    assert.equal(
      contentWriteTarget({
        context: "deploy-preview",
        deployBranch: "refs/pull/17/merge",
        headBranch: "master",
        pullRequest: "true",
        reviewId: "17",
        owner: "stellaroskens",
        repo: "WAHSB",
      }).ok,
      false,
    )
    const disagree = targetFrom(emptyRuntime, {
      context: "deploy-preview",
      branch: "cursor/other-branch",
      head: "cursor/portal-visual",
      pullRequest: "true",
      reviewId: "17",
    })
    assert.equal(disagree.ok, false)
    const signals = targetFrom(emptyRuntime, {
      context: "deploy-preview",
      branch: "pull/17/head",
      head: "cursor/portal-visual",
      pullRequest: "false",
      reviewId: "17",
    })
    assert.equal(signals.ok, false)
    const otherRepo = targetFrom(emptyRuntime, previewCapture)
    assert.equal(otherRepo.ok, true)
    const rejected = contentWriteTarget({
      context: "deploy-preview",
      deployBranch: "pull/17/head",
      headBranch: "cursor/portal-visual",
      pullRequest: "true",
      reviewId: "17",
      owner: "someone-else",
      repo: "WAHSB",
    })
    assert.equal(rejected.ok, false)
    if (!rejected.ok) assert.equal(rejected.code, "repository_rejected")
  })

  it("records the preview build without credentials and keeps it out of the client source", () => {
    const dir = mkdtempSync(join(tmpdir(), "ahsb-deploy-target-"))
    const output = join(dir, "deployTarget.generated.ts")
    const script = fileURLToPath(new URL("../scripts/captureDeployTarget.mjs", import.meta.url))
    const result = spawnSync(process.execPath, [script, output], {
      env: {
        ...process.env,
        CONTEXT: "deploy-preview",
        BRANCH: "pull/17/head",
        HEAD: "cursor/portal-visual",
        PULL_REQUEST: "true",
        REVIEW_ID: "17",
        GITHUB_CONTENT_TOKEN: "ghp_thisMustNotBeWritten",
        GITHUB_TOKEN: "github_pat_thisMustNotBeWritten",
      },
    })
    assert.equal(result.status, 0)
    const text = readFileSync(output, "utf8")
    assert.match(text, /"context": "deploy-preview"/)
    assert.match(text, /"branch": "pull\/17\/head"/)
    assert.match(text, /"head": "cursor\/portal-visual"/)
    assert.match(text, /"reviewId": "17"/)
    assert.doesNotMatch(text, /ghp_|github_pat_|GITHUB_CONTENT_TOKEN|postgres:\/\//)
    const captureSource = readFileSync(script, "utf8")
    assert.doesNotMatch(captureSource, /GITHUB_CONTENT_TOKEN|GITHUB_TOKEN|process\.env\[/)
    const secretResult = spawnSync(process.execPath, [script, output], {
      env: { ...process.env, CONTEXT: "ghp_hidden", BRANCH: "", HEAD: "", PULL_REQUEST: "", REVIEW_ID: "" },
    })
    assert.equal(secretResult.status, 0)
    assert.doesNotMatch(readFileSync(output, "utf8"), /ghp_/)
    const root = fileURLToPath(new URL("../src", import.meta.url))
    const pending = [root]
    while (pending.length) {
      const current = pending.pop()
      if (!current) break
      for (const entry of readdirSync(current)) {
        const path = join(current, entry)
        if (statSync(path).isDirectory()) {
          pending.push(path)
          continue
        }
        if (!/\.(ts|tsx|css)$/.test(path)) continue
        assert.doesNotMatch(readFileSync(path, "utf8"), /capturedDeployTarget|deployTarget\.generated/)
      }
    }
  })
})
