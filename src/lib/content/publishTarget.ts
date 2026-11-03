export const CONTENT_OWNER = "stellaroskens"
export const CONTENT_REPO = "WAHSB"

const REVIEW_CONTEXTS = new Set(["deploy-preview", "branch-deploy", "dev"])
const BRANCH_PATTERN = /^[A-Za-z0-9._/-]{1,80}$/

export type ContentWriteTarget =
  | { ok: true; owner: typeof CONTENT_OWNER; repo: typeof CONTENT_REPO; branch: string }
  | { ok: false; code: "repository_rejected" | "production_write_blocked" | "preview_branch_required"; message: string }

/**
 * Chooses the GitHub write target from Netlify's own deploy values.
 * Browser input is not accepted. A site-wide branch variable is not accepted.
 * Production and main are refused so a preview cannot change the live site.
 */
function reviewBranch(value: string | undefined): string | null {
  const branch = value?.trim() || ""
  if (!BRANCH_PATTERN.test(branch) || branch.includes("..") || branch === "main" || branch === "master") return null
  return branch
}

function serverContext(context: string | undefined, pullRequest: string | undefined): string {
  const explicit = context?.trim() || ""
  if (explicit) return explicit
  const pull = pullRequest?.trim() || ""
  if (pull === "true" || /^[1-9]\d*$/.test(pull)) return "deploy-preview"
  return ""
}

export function contentWriteTarget(input: {
  context: string | undefined
  deployBranch: string | undefined
  headBranch?: string | undefined
  pullRequest?: string | undefined
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

  const context = serverContext(input.context, input.pullRequest)
  if (context === "production") {
    return {
      ok: false,
      code: "production_write_blocked",
      message: "This deploy is production. Publishing from this build will not write the live branch. Nothing was saved.",
    }
  }

  const branch = reviewBranch(input.deployBranch) ?? reviewBranch(input.headBranch)
  if (!REVIEW_CONTEXTS.has(context) || !branch) {
    return {
      ok: false,
      code: "preview_branch_required",
      message: "This site is not a review branch, so nothing was written to the live website.",
    }
  }
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
