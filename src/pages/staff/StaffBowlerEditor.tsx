import { useState } from "react"
import { Link } from "react-router-dom"
import { PageMeta } from "../../components/PageMeta"
import published from "../../content/published/siteContent.json"
import { BowlerProfileEditor } from "../admin/BowlerProfileEditor"
import { useAuth } from "../../lib/auth/AuthProvider"
import { mayPublishBowlerProfiles } from "../../lib/auth/permissions"
import {
  GITHUB_SETUP_STEPS,
  draftRequestBody,
  failureMessage,
  prepareContentForSave,
  publishRequestBody,
  successMessage,
} from "../../lib/content/pageEditor"
import { parseSiteContent, validateSiteContent, type SiteContent } from "../../lib/content/siteContent"
import { rolesFromUser } from "../../lib/auth/session"

const publishedContent = parseSiteContent(published)

export function StaffBowlerEditor() {
  const { user } = useAuth()
  const roles = rolesFromUser(user)
  const canPublish = mayPublishBowlerProfiles(roles)
  const [content, setContent] = useState<SiteContent>(() => structuredClone(publishedContent))
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [githubMissing, setGithubMissing] = useState(false)

  const save = async (submitForApproval: boolean) => {
    setBusy(true)
    setError(null)
    setMessage(null)
    const prepared = prepareContentForSave(content)
    const issues = validateSiteContent(prepared)
    if (issues.length) {
      setBusy(false)
      setError(issues[0]?.message || "Fix the bowler fields before saving. Nothing was saved.")
      return
    }
    try {
      const response = await fetch("/api/content/drafts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(draftRequestBody("bowlers", prepared, submitForApproval)),
      })
      const body = (await response.json().catch(() => ({ error: "Draft storage could not be reached." }))) as {
        error?: string
        code?: string
        commitSha?: string
      }
      if (!response.ok) throw new Error(failureMessage(response.status, body))
      const saved = successMessage(submitForApproval ? "approval" : "draft", body)
      if (!saved) throw new Error("GitHub did not return a commit, so this draft was not saved. The live site is unchanged.")
      setContent(prepared)
      setMessage(saved)
    } catch (err) {
      const text = err instanceof Error ? err.message : "Could not save the draft."
      if (text.includes("not configured") || text.includes("GitHub")) setGithubMissing(true)
      setError(text)
    } finally {
      setBusy(false)
    }
  }

  const publish = async () => {
    if (!canPublish) return
    if (!window.confirm("Publish the content file? The live site updates only after Netlify deploys the GitHub commit.")) return
    setBusy(true)
    setError(null)
    const prepared = prepareContentForSave(content)
    const issues = validateSiteContent(prepared)
    if (issues.length) {
      setBusy(false)
      setError(issues[0]?.message || "Nothing was published.")
      return
    }
    try {
      const response = await fetch("/api/content/publish", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(publishRequestBody(prepared)),
      })
      const body = (await response.json().catch(() => ({ error: "Publishing could not be reached." }))) as {
        error?: string
        code?: string
        commitSha?: string
        note?: string
      }
      if (!response.ok) throw new Error(failureMessage(response.status, body))
      const saved = successMessage("publish", body)
      if (!saved) throw new Error("GitHub did not return a commit, so nothing was published.")
      setMessage(saved)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-page">
      <PageMeta title="Meet the Bowlers editor | AHSB" description="Staff editor for AHSB bowler profiles." />
      <p>
        <Link to="/coach">Coach dashboard</Link>
        {" · "}
        <Link to="/team-administrator">Club Administrator dashboard</Link>
        {" · "}
        <Link to="/admin">Main admin dashboard</Link>
      </p>
      <h2>Meet the Bowlers</h2>
      <p>Edits stay in this browser until a draft is saved. Publishing is limited to the super administrator.</p>
      {error ? <p className="admin-alert admin-alert--error" role="alert">{error}</p> : null}
      {message ? <p className="admin-alert" role="status">{message}</p> : null}
      <BowlerProfileEditor content={content} onChange={setContent} />
      <div className="admin-form__actions">
        <button className="admin-btn" type="button" disabled={busy} onClick={() => void save(false)}>
          Save draft
        </button>
        <button className="admin-btn admin-btn--ghost" type="button" disabled={busy} onClick={() => void save(true)}>
          Submit for approval
        </button>
        {canPublish ? (
          <button className="admin-btn admin-btn--ghost" type="button" disabled={busy} onClick={() => void publish()}>
            Publish
          </button>
        ) : (
          <p className="admin-help">Publish stays with the super administrator. This role can save a draft for review.</p>
        )}
      </div>
      {githubMissing ? (
        <ol>
          {GITHUB_SETUP_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : null}
    </div>
  )
}
