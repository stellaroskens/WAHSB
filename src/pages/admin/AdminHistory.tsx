import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { PageMeta } from "../../components/PageMeta"
import { GITHUB_SETUP_STEPS, failureMessage } from "../../lib/content/pageEditor"

type Commit = { sha: string; message: string; date: string | null; url: string | null }

export function AdminHistory() {
  const [commits, setCommits] = useState<Commit[]>([])
  const [error, setError] = useState<string | null>(null)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/content/history", { credentials: "include" })
      const body = (await response.json().catch(() => ({ error: "Publishing history could not be reached." }))) as {
        error?: string
        code?: string
        commits?: Commit[]
      }
      if (!response.ok) {
        setError(failureMessage(response.status, body))
        setMissing(response.status === 503 || body.code === "github_token_missing")
        return
      }
      setCommits(body.commits ?? [])
    })()
  }, [])

  return (
    <div className="admin-page">
      <PageMeta title="Publishing History | Albany High School Bowling" description="Published content versions for Albany High School Bowling." />
      <div className="admin-page__intro">
        <h2>Publishing history</h2>
        <p>These are GitHub commits for the published content file. Loading one opens it in the editor. The live site changes only after you publish and Netlify finishes deploying.</p>
      </div>
      {error && <p className="admin-alert admin-alert--error" role="alert">{error}</p>}
      {missing && (
        <details className="admin-advanced" open>
          <summary>GitHub publishing setup</summary>
          <ol>{GITHUB_SETUP_STEPS.map((step) => <li key={step}>{step}</li>)}</ol>
        </details>
      )}
      {commits.length === 0 && !error ? <p>No published commits were returned.</p> : null}
      <ul className="admin-section-list">
        {commits.map((commit) => (
          <li key={commit.sha} className="admin-section-list__item">
            <div>
              <h3>{commit.message}</h3>
              <p>
                {commit.date ? new Date(commit.date).toLocaleString() : "Date unavailable"} · {commit.sha.slice(0, 7)}
              </p>
              <p>
                <Link to={`/admin/content?version=${commit.sha}`}>Load this version into the editor</Link>
              </p>
            </div>
            <span className="admin-badge">Published commit</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
