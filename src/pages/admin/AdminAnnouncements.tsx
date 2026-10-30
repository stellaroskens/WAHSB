import { useEffect, useState, type FormEvent } from "react"
import { PageMeta } from "../../components/PageMeta"
import { siteConnectionsConfig } from "../../content/siteConnections"
import { validateAnnouncementDraft } from "../../lib/content/announcementDraft"
import { failureMessage } from "../../lib/content/pageEditor"

const empty = { title: "", subject: "", message: "", audienceDescription: "" }

export function AdminAnnouncements() {
  const email = siteConnectionsConfig.email
  const ready = email.liveEnabled && email.status === "verified"
  const [draftId, setDraftId] = useState("working")
  const [fields, setFields] = useState(empty)
  const [status, setStatus] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/admin/announcements", { credentials: "include" })
      if (response.status === 503) {
        const body = (await response.json().catch(() => ({ error: "GitHub publishing is not configured. Nothing was saved." }))) as {
          error?: string
        }
        setError(body.error || "GitHub publishing is not configured. Nothing was saved.")
      }
    })()
  }, [])

  const save = async (submitForApproval: boolean) => {
    setError(null)
    setMessage(null)
    const checked = validateAnnouncementDraft(fields)
    if (!checked.ok) {
      setError(checked.message)
      return
    }
    setBusy(true)
    try {
      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ id: draftId, draft: checked.draft, submitForApproval }),
      })
      const body = (await response.json()) as { error?: string; code?: string; commitSha?: string; status?: string }
      if (!response.ok) throw new Error(failureMessage(response.status, body))
      if (!body.commitSha) throw new Error("GitHub did not return a commit, so this draft was not saved.")
      setStatus(body.status ?? "draft")
      setMessage(
        submitForApproval
          ? `Draft submitted for approval (commit ${body.commitSha.slice(0, 7)}). No email was sent.`
          : `Draft saved (commit ${body.commitSha.slice(0, 7)}). No email was sent.`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the announcement.")
    } finally {
      setBusy(false)
    }
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    void save(false)
  }

  const onLoad = async () => {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch(`/api/admin/announcements?id=${encodeURIComponent(draftId)}`, { credentials: "include" })
      const body = (await response.json()) as { error?: string; code?: string; draft?: { status?: string; draft?: unknown } }
      if (!response.ok) throw new Error(failureMessage(response.status, body))
      const checked = validateAnnouncementDraft(body.draft?.draft)
      if (!checked.ok) throw new Error(checked.message)
      setFields(checked.draft)
      setStatus(body.draft?.status ?? "draft")
      setMessage("Loaded the saved announcement. No email was sent.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load that draft.")
    } finally {
      setBusy(false)
    }
  }

  const onDelete = () => {
    const confirmed = window.confirm("Delete this announcement from the form? A saved GitHub copy stays until a later cleanup.")
    if (!confirmed) return
    setFields(empty)
    setStatus(null)
    setMessage("Cleared the form. This does not delete a copy already saved in GitHub.")
  }

  return (
    <div className="admin-page">
      <PageMeta
        title="Email Announcements | Albany High School Bowling"
        description="Draft email announcements for Albany High School Bowling."
      />
      <div className="admin-page__intro">
        <h2>Email announcements</h2>
        <p>Save a draft here. Sending stays off until a verified email provider is connected. Do not enter parent or student email addresses.</p>
      </div>
      {error && <p className="admin-alert admin-alert--error" role="alert">{error}</p>}
      {message && <p className="admin-alert" role="status">{message}</p>}
      <ul className="admin-section-list">
        <li className="admin-section-list__item">
          <div>
            <h3>Email connection</h3>
            <p>
              Provider: {email.providerLabel ?? "Not configured"} · Status: {email.status}
              {email.liveEnabled ? " (live)" : " (not live)"}
            </p>
          </div>
          <span className="admin-badge">{ready ? "Connected" : "Sending off"}</span>
        </li>
      </ul>
      <form className="admin-panel-form" onSubmit={onSubmit}>
        <h3>Draft announcement</h3>
        <p className="admin-help">{status ? `Saved status: ${status}.` : "Not saved yet."} Preview below uses this form only.</p>
        <label>
          Draft name
          <input value={draftId} onChange={(event) => setDraftId(event.target.value)} required pattern="[A-Za-z0-9_-]+" />
        </label>
        <label>
          Announcement title
          <input value={fields.title} onChange={(event) => setFields({ ...fields, title: event.target.value })} />
        </label>
        <label>
          Subject
          <input value={fields.subject} onChange={(event) => setFields({ ...fields, subject: event.target.value })} />
        </label>
        <label>
          Audience description
          <input
            value={fields.audienceDescription}
            onChange={(event) => setFields({ ...fields, audienceDescription: event.target.value })}
          />
          <span className="admin-help">Example: Families of athletes already on the roster. Do not paste addresses.</span>
        </label>
        <label>
          Message
          <textarea rows={8} value={fields.message} onChange={(event) => setFields({ ...fields, message: event.target.value })} />
        </label>
        <div className="admin-form__actions">
          <button className="admin-btn" type="submit" disabled={busy}>Save draft</button>
          <button className="admin-btn admin-btn--ghost" type="button" disabled={busy} onClick={() => void save(true)}>
            Submit for approval
          </button>
          <button className="admin-btn admin-btn--ghost" type="button" disabled={busy} onClick={() => void onLoad()}>
            Load saved draft
          </button>
          <button className="admin-btn admin-btn--ghost" type="button" disabled={busy} onClick={onDelete}>
            Clear form
          </button>
        </div>
      </form>
      <section className="admin-preview" aria-label="DRAFT PREVIEW — NOT PUBLISHED">
        <p className="admin-preview__banner">DRAFT PREVIEW — NOT SENT</p>
        <h3>{fields.title || "Untitled announcement"}</h3>
        <p><strong>Subject:</strong> {fields.subject || "(empty)"}</p>
        <p><strong>Audience:</strong> {fields.audienceDescription || "(empty)"}</p>
        <p style={{ whiteSpace: "pre-wrap" }}>{fields.message || "(empty)"}</p>
        <p>This preview does not send email and does not publish the announcement.</p>
      </section>
    </div>
  )
}
