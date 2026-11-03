import { contentWriteTarget, githubReadFailure, githubWriteResult } from "../../../src/lib/content/publishTarget.ts"

declare const Netlify: {
  env: {
    get(name: string): string | undefined
  }
}

const PUBLISHED_PATH = "src/content/published/siteContent.json"
const CONNECTIONS_PATH = "src/content/published/siteConnections.json"
const DRAFTS_PREFIX = "content/drafts/"

function serverValue(name: "CONTEXT" | "BRANCH" | "HEAD" | "PULL_REQUEST" | "REVIEW_ID"): string | undefined {
  const scoped = Netlify.env.get(name)
  if (typeof scoped === "string" && scoped.trim()) return scoped
  const runtime = process.env[name]
  return typeof runtime === "string" && runtime.trim() ? runtime : undefined
}

export function githubConfig():
  | { ok: true; token: string; owner: string; repo: string; branch: string }
  | { ok: false; status: number; code: string; message: string } {
  const token = Netlify.env.get("GITHUB_CONTENT_TOKEN") || Netlify.env.get("GITHUB_TOKEN")
  if (!token) {
    return {
      ok: false,
      status: 503,
      code: "github_token_missing",
      message:
        "GitHub content token is not configured. Set GITHUB_CONTENT_TOKEN in Netlify env (never in Vite/public).",
    }
  }
  const target = contentWriteTarget({
    context: serverValue("CONTEXT"),
    deployBranch: serverValue("BRANCH"),
    headBranch: serverValue("HEAD"),
    pullRequest: serverValue("PULL_REQUEST"),
    reviewId: serverValue("REVIEW_ID"),
    owner: Netlify.env.get("GITHUB_CONTENT_OWNER"),
    repo: Netlify.env.get("GITHUB_CONTENT_REPO"),
  })
  if (!target.ok) return { ok: false, status: 409, code: target.code, message: target.message }
  return { ok: true, token, owner: target.owner, repo: target.repo, branch: target.branch }
}

async function gh<T>(
  config: { token: string; owner: string; repo: string },
  path: string,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; status: number; message: string }> {
  const response = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${config.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  })
  if (!response.ok) {
    await response.text()
    return { ok: false, status: response.status, message: "GitHub request failed." }
  }
  if (response.status === 204) return { ok: true, data: null as T }
  return { ok: true, data: (await response.json()) as T }
}

export async function getFileContent(
  config: { token: string; owner: string; repo: string; branch: string },
  path: string,
  ref = config.branch,
): Promise<{ ok: true; content: string; sha: string } | { ok: false; status: number; message: string }> {
  const result = await gh<{ content?: string; sha?: string; encoding?: string }>(
    config,
    `/contents/${path}?ref=${encodeURIComponent(ref)}`,
  )
  if (!result.ok) return githubReadFailure(result.status)
  if (!result.data.content || !result.data.sha) {
    return { ok: false, status: 502, code: "github_read_failed", message: "GitHub could not be read. Nothing was changed." }
  }
  const content = Buffer.from(result.data.content, "base64").toString("utf8")
  return { ok: true, content, sha: result.data.sha }
}

export async function putBinaryContent(
  config: { token: string; owner: string; repo: string; branch: string },
  path: string,
  base64: string,
  message: string,
  sha?: string,
): Promise<{ ok: true; commitSha: string } | { ok: false; status: number; message: string }> {
  const body: Record<string, unknown> = { message, content: base64, branch: config.branch }
  if (sha) body.sha = sha
  const result = await gh<{ commit?: { sha?: string } }>(config, `/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify(body),
  })
  return githubWriteResult(result.ok ? 200 : result.status, result.ok ? result.data.commit?.sha : undefined)
}

export async function deleteRepoFile(
  config: { token: string; owner: string; repo: string; branch: string },
  path: string,
  message: string,
  sha: string,
): Promise<{ ok: true; commitSha: string } | { ok: false; status: number; message: string }> {
  const result = await gh<{ commit?: { sha?: string } }>(config, `/contents/${path}`, {
    method: "DELETE",
    body: JSON.stringify({ message, sha, branch: config.branch }),
  })
  return githubWriteResult(result.ok ? 200 : result.status, result.ok ? result.data.commit?.sha : undefined)
}

export async function putFileContent(
  config: { token: string; owner: string; repo: string; branch: string },
  path: string,
  content: string,
  message: string,
  sha?: string,
): Promise<{ ok: true; commitSha: string } | { ok: false; status: number; message: string }> {
  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(content, "utf8").toString("base64"),
    branch: config.branch,
  }
  if (sha) body.sha = sha
  const result = await gh<{ commit?: { sha?: string } }>(config, `/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify(body),
  })
  return githubWriteResult(result.ok ? 200 : result.status, result.ok ? result.data.commit?.sha : undefined)
}

export async function listDraftFiles(
  config: { token: string; owner: string; repo: string; branch: string },
): Promise<{ ok: true; files: { name: string; path: string }[] } | { ok: false; status: number; message: string }> {
  const result = await gh<Array<{ name: string; path: string; type: string }> | { message?: string }>(
    config,
    `/contents/${DRAFTS_PREFIX}?ref=${encodeURIComponent(config.branch)}`,
  )
  if (!result.ok) {
    if (result.status === 404) return { ok: true, files: [] }
    return githubReadFailure(result.status)
  }
  if (!Array.isArray(result.data)) return { ok: true, files: [] }
  return {
    ok: true,
    files: result.data
      .filter((item) => item.type === "file" && item.name.endsWith(".json"))
      .map((item) => ({ name: item.name, path: item.path })),
  }
}

export async function listPathCommits(
  config: { token: string; owner: string; repo: string; branch: string },
  path: string,
): Promise<
  | { ok: true; commits: { sha: string; message: string; date: string | null; url: string | null }[] }
  | { ok: false; status: number; message: string }
> {
  const result = await gh<
    Array<{ sha?: string; html_url?: string; commit?: { message?: string; author?: { date?: string } } }>
  >(
    config,
    `/commits?path=${encodeURIComponent(path)}&sha=${encodeURIComponent(config.branch)}&per_page=20`,
  )
  if (!result.ok) return githubReadFailure(result.status)
  if (!Array.isArray(result.data)) return { ok: true, commits: [] }
  return {
    ok: true,
    commits: result.data
      .filter((item) => typeof item.sha === "string")
      .map((item) => ({
        sha: item.sha as string,
        message: item.commit?.message?.split("\n")[0] ?? "Content update",
        date: item.commit?.author?.date ?? null,
        url: item.html_url ?? null,
      })),
  }
}

export { PUBLISHED_PATH, CONNECTIONS_PATH, DRAFTS_PREFIX }
