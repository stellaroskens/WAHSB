import { useEffect, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { PageMeta } from "../../components/PageMeta"
import published from "../../content/published/siteContent.json"
import { validateSiteContent, type SiteContent } from "../../lib/content/siteContent"

export function AdminContent() {
  const [text, setText] = useState(() => JSON.stringify(published, null, 2))
  const [draftId, setDraftId] = useState("working-draft")
  const [drafts, setDrafts] = useState<{ id: string; status: string }[]>([])
  const [issues, setIssues] = useState<{ path: string; message: string }[]>([])
  const [preview, setPreview] = useState<SiteContent | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const refreshDrafts = async () => {
    const response = await fetch("/api/content/drafts", { credentials: "include" })
    if (!response.ok) return
    const body = (await response.json()) as { drafts?: { id: string; status: string }[] }
    setDrafts(body.drafts ?? [])
  }

  useEffect(() => {
    void refreshDrafts()
  }, [])

  const runValidate = () => {
    try {
      const parsed = JSON.parse(text) as unknown
      const nextIssues = validateSiteContent(parsed)
      setIssues(nextIssues)
      if (!nextIssues.length) setPreview(parsed as SiteContent)
      else setPreview(null)
      return nextIssues
    } catch {
      const next = [{ path: "", message: "Invalid JSON." }]
      setIssues(next)
      setPreview(null)
      return next
    }
  }

  const onSaveDraft = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)
    const nextIssues = runValidate()
    if (nextIssues.length) {
      setBusy(false)
      setError("Fix validation issues before saving a draft.")
      return
    }
    try {
      const response = await fetch("/api/content/drafts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ id: draftId, content: JSON.parse(text) }),
      })
      const body = (await response.json()) as { error?: string; commitSha?: string; note?: string }
      if (!response.ok) throw new Error(body.error || "Could not save draft.")
      setMessage(`Draft saved${body.commitSha ? ` (commit ${body.commitSha.slice(0, 7)})` : ""}. Live site unchanged.`)
      await refreshDrafts()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save draft.")
    } finally {
      setBusy(false)
    }
  }

  const onPublish = async () => {
    setBusy(true)
    setError(null)
    setMessage(null)
    const nextIssues = runValidate()
    if (nextIssues.length) {
      setBusy(false)
      setError("Fix validation issues before publishing.")
      return
    }
    try {
      const response = await fetch("/api/content/publish", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ draftId, content: JSON.parse(text), message: `content: publish ${draftId}` }),
      })
      const body = (await response.json()) as { error?: string; commitSha?: string; note?: string }
      if (!response.ok) throw new Error(body.error || "Publish failed.")
      setMessage(body.note || `Published${body.commitSha ? ` (${body.commitSha.slice(0, 7)})` : ""}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-page">
      <PageMeta title="Website Pages | Albany High School Bowling" description="Authenticated content editor for WAHSB." />
      <div className="admin-page__intro">
        <h2>Website Pages</h2>
        <p>
          Edit typed published content as JSON. Saving creates a <strong>draft</strong> commit under{" "}
          <code>content/drafts/</code>. Publishing (super_admin only) updates{" "}
          <code>src/content/published/siteContent.json</code> via the GitHub API — tokens never ship to the browser.
        </p>
        <p>
          Decap CMS was evaluated and not used: WAHSB content is typed JSON with custom role-based propose/approve
          publishing, which Decap’s collection + Git Gateway model does not fit cleanly.
        </p>
      </div>

      {error && (
        <p className="admin-alert admin-alert--error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="admin-alert" role="status">
          {message}
        </p>
      )}

      <form className="admin-panel-form" onSubmit={onSaveDraft}>
        <label>
          Draft id
          <input value={draftId} onChange={(event) => setDraftId(event.target.value)} required />
        </label>
        <label>
          Content JSON
          <textarea
            className="admin-code"
            rows={22}
            value={text}
            onChange={(event) => setText(event.target.value)}
            spellCheck={false}
          />
        </label>
        <div className="admin-form__actions">
          <button className="admin-btn" type="button" onClick={() => runValidate()} disabled={busy}>
            Validate / preview
          </button>
          <button className="admin-btn" type="submit" disabled={busy}>
            {busy ? "Working…" : "Save draft"}
          </button>
          <button className="admin-btn admin-btn--ghost" type="button" onClick={onPublish} disabled={busy}>
            Approve & publish
          </button>
        </div>
      </form>

      {issues.length > 0 && (
        <ul className="admin-section-list">
          {issues.map((issue) => (
            <li key={`${issue.path}:${issue.message}`} className="admin-section-list__item">
              <div>
                <h3>{issue.path || "(root)"}</h3>
                <p>{issue.message}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {preview && (
        <div className="admin-page__intro" style={{ marginTop: "1.5rem" }}>
          <h3>Draft preview (not live)</h3>
          <p>
            Team Gear: {preview.teamGearShop.name} → {preview.teamGearShop.teamStoreUrl ?? preview.teamGearShop.url}
          </p>
          <p>
            Nav labels: {preview.nav.map((item) => item.label).join(" · ")}
          </p>
          <p>
            Tournaments: {preview.practiceTournaments.length} · Coaches: {preview.coaches.length} · Fundraisers:{" "}
            {preview.fundraisers.length}
          </p>
          <p>
            <Link to="/team-gear">Open live Team Gear page</Link> (still shows published content until deploy)
          </p>
        </div>
      )}

      <div className="admin-page__intro" style={{ marginTop: "1.5rem" }}>
        <h3>Drafts in Git</h3>
        {drafts.length === 0 ? (
          <p>No draft files yet (or GitHub token not configured).</p>
        ) : (
          <ul className="admin-section-list">
            {drafts.map((draft) => (
              <li key={draft.id} className="admin-section-list__item">
                <div>
                  <h3>{draft.id}</h3>
                  <p>Status: {draft.status}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
