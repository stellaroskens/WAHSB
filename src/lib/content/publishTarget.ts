export const CONTENT_OWNER = "stellaroskens"
export const CONTENT_REPO = "WAHSB"

const REVIEW_CONTEXTS = new Set(["deploy-preview", "branch-deploy", "dev"])
const BRANCH_PATTERN = /^[A-Za-z0-9._/-]{1,80}$/
const PULL_CHECKOUT = /^(?:refs\/)?pull\/\d+\/(?:head|merge)$/

export type ContentWriteTarget =
  | { ok: true; owner: typeof CONTENT_OWNER; repo: typeof CONTENT_REPO; branch: string }
  | { ok: false; code: "repository_rejected" | "production_write_blocked" | "preview_branch_required"; message: string }

export type DeployMetadata = {
  context?: string
  deployBranch?: string
  headBranch?: string
  pullRequest?: string
  reviewId?: string
}

const PREVIEW_BRANCH_REQUIRED = {
  ok: false as const,
  code: "preview_branch_required" as const,
  message: "This site is not a review branch, so nothing was written to the live website.",
}

/**
 * Chooses the GitHub write target from Netlify's own deploy values.
 * Browser input is not accepted. A site-wide branch variable is not accepted.
 * Production and main are refused so a preview cannot change the live site.
 */
function reviewBranch(value: string | undefined): string | null {
  let branch = value?.trim() || ""
  if (branch.startsWith("refs/heads/")) branch = branch.slice("refs/heads/".length)
  if (PULL_CHECKOUT.test(branch)) return null
  if (!BRANCH_PATTERN.test(branch) || branch.includes("..") || branch === "main" || branch === "master") return null
  return branch
}

function isReviewSignal(value: string | undefined): boolean {
  const signal = value?.trim() || ""
  return signal === "true" || /^[1-9]\d*$/.test(signal)
}

function signalKind(value: string | undefined): "absent" | "yes" | "no" | "invalid" {
  const signal = value?.trim() || ""
  if (!signal) return "absent"
  if (signal === "true" || /^[1-9]\d*$/.test(signal)) return "yes"
  if (signal === "false" || signal === "0") return "no"
  return "invalid"
}

function reviewSignalsDisagree(pullRequest: string | undefined, reviewId: string | undefined): boolean {
  const pull = signalKind(pullRequest)
  const review = signalKind(reviewId)
  if (pull === "invalid" || review === "invalid") return true
  if (pull === "yes" && review === "no") return true
  if (pull === "no" && review === "yes") return true
  const pullText = pullRequest?.trim() || ""
  const reviewText = reviewId?.trim() || ""
  if (/^[1-9]\d*$/.test(pullText) && /^[1-9]\d*$/.test(reviewText) && pullText !== reviewText) return true
  return false
}

function serverContext(context: string | undefined, pullRequest: string | undefined, reviewId: string | undefined): string {
  const explicit = context?.trim() || ""
  if (explicit) return explicit
  if (isReviewSignal(pullRequest) || isReviewSignal(reviewId)) return "deploy-preview"
  return ""
}

function filled(value: string | undefined): string | undefined {
  const trimmed = value?.trim() || ""
  return trimmed || undefined
}

function textField(value: unknown): string | undefined {
  return typeof value === "string" ? filled(value) : undefined
}

/** Maps the build-time capture file onto the deploy fields. Unknown shapes are empty. */
export function metadataFromCapture(captured: unknown): DeployMetadata {
  if (!captured || typeof captured !== "object" || Array.isArray(captured)) return {}
  const record = captured as Record<string, unknown>
  return {
    context: textField(record.context),
    deployBranch: textField(record.branch),
    headBranch: textField(record.head),
    pullRequest: textField(record.pullRequest),
    reviewId: textField(record.reviewId),
  }
}

/**
 * Fills gaps in the function runtime from the build-time capture.
 * A production context on either side stays production.
 */
export function mergeDeployMetadata(runtime: DeployMetadata, captured: DeployMetadata): DeployMetadata {
  const pick = (live: string | undefined, stored: string | undefined) => filled(live) ?? filled(stored)
  const runtimeContext = filled(runtime.context)
  const capturedContext = filled(captured.context)
  const context =
    runtimeContext === "production" || capturedContext === "production"
      ? "production"
      : pick(runtime.context, captured.context)
  return {
    context,
    deployBranch: pick(runtime.deployBranch, captured.deployBranch),
    headBranch: pick(runtime.headBranch, captured.headBranch),
    pullRequest: pick(runtime.pullRequest, captured.pullRequest),
    reviewId: pick(runtime.reviewId, captured.reviewId),
  }
}

export function reviewDraftPath(id: string): { id: string; path: string } {
  const safe = id.replace(/[^a-zA-Z0-9_-]/g, "")
  return { id: safe, path: `content/drafts/${safe}.json` }
}

export function contentWriteTarget(input: {
  context: string | undefined
  deployBranch: string | undefined
  headBranch?: string | undefined
  pullRequest?: string | undefined
  reviewId?: string | undefined
  owner: string | undefined
  repo: string | undefined
}): ContentWriteTarget {
  const owner = input.owner?.trim() || CONTENT_OWNER
  const repo = input.repo?.trim() || CONTENT_REPO
  if (owner !== CONTENT_OWNER || repo !== CONTENT_REPO) {
    return {
      ok: false,
      code: "repository_rejected",
      message: "Content can be saved only to the AHSB repository. Nothing was saved.",
    }
  }

  const context = serverContext(input.context, input.pullRequest, input.reviewId)
  if (context === "production") {
    return {
      ok: false,
      code: "production_write_blocked",
      message: "This deploy is production. Publishing from this build will not write the live branch. Nothing was saved.",
    }
  }

  if (reviewSignalsDisagree(input.pullRequest, input.reviewId)) return PREVIEW_BRANCH_REQUIRED
  if (context === "deploy-preview" && signalKind(input.pullRequest) !== "yes" && signalKind(input.reviewId) !== "yes") {
    return PREVIEW_BRANCH_REQUIRED
  }

  const deploy = reviewBranch(input.deployBranch)
  const head = reviewBranch(input.headBranch)
  if (deploy && head && deploy !== head) return PREVIEW_BRANCH_REQUIRED
  const branch = head ?? deploy
  if (!REVIEW_CONTEXTS.has(context) || !branch) return PREVIEW_BRANCH_REQUIRED
  return { ok: true, owner: CONTENT_OWNER, repo: CONTENT_REPO, branch }
}

export type GithubWriteResult =
  | { ok: true; commitSha: string }
  | { ok: false; status: number; code: string; message: string }

/** Maps a GitHub HTTP result to a client-safe message. The response body is ignored. */
export function githubWriteResult(httpStatus: number, commitSha: string | undefined): GithubWriteResult {
  if (httpStatus >= 200 && httpStatus < 300) {
    if (!commitSha) {
      return {
        ok: false,
        status: 502,
        code: "github_write_failed",
        message: "GitHub did not confirm the save. Nothing was published.",
      }
    }
    return { ok: true, commitSha }
  }
  if (httpStatus === 401 || httpStatus === 403) {
    return {
      ok: false,
      status: 503,
      code: "github_token_rejected",
      message: "GitHub rejected the content token. It may be expired or missing permission. Nothing was saved.",
    }
  }
  if (httpStatus === 409 || httpStatus === 422) {
    return {
      ok: false,
      status: 409,
      code: "github_conflict",
      message: "GitHub has a newer copy of this file. Nothing was saved. Reload the editor and try again.",
    }
  }
  if (httpStatus === 404) {
    return {
      ok: false,
      status: 404,
      code: "github_not_found",
      message: "GitHub could not find that file. Nothing was saved.",
    }
  }
  return {
    ok: false,
    status: 502,
    code: "github_write_failed",
    message: "GitHub did not save the change. Nothing was published.",
  }
}

export function githubReadFailure(httpStatus: number): { ok: false; status: number; code: string; message: string } {
  if (httpStatus === 401 || httpStatus === 403) {
    return {
      ok: false,
      status: 503,
      code: "github_token_rejected",
      message: "GitHub rejected the content token. It may be expired or missing permission. Nothing was changed.",
    }
  }
  if (httpStatus === 404) {
    return { ok: false, status: 404, code: "github_not_found", message: "That file was not found on the review branch." }
  }
  return { ok: false, status: 502, code: "github_read_failed", message: "GitHub could not be read. Nothing was changed." }
}
