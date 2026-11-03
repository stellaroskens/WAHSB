import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { PageMeta } from "../../components/PageMeta"
import published from "../../content/published/siteContent.json"
import {
  DRAFT_PREVIEW_LABEL,
  EDITOR_PAGES,
  GITHUB_SETUP_STEPS,
  contentFromDraftPayload,
  draftRequestBody,
  editField,
  failureMessage,
  fieldText,
  issuesForSection,
  pageById,
  prepareContentForSave,
  publishRequestBody,
  reviewContentChanges,
  sectionsForPage,
  successMessage,
  type EditorField,
} from "../../lib/content/pageEditor"
import { parseSiteContent, validateSiteContent, type SiteContent, type SiteContentIssue } from "../../lib/content/siteContent"
import { PublishStatus } from "../../components/staff/PublishStatus"
import { StaffAction } from "../../components/staff/StaffAction"
import { StaffHelp } from "../../components/staff/StaffHelp"
import { BowlerProfileEditor } from "./BowlerProfileEditor"
import { LibraryEditor } from "./LibraryEditor"

const publishedContent = parseSiteContent(published)

async function readBody(response: Response): Promise<{
  error?: string
  code?: string
  commitSha?: string
  note?: string
  content?: unknown
}> {
  const text = await response.text()
  try {
    return JSON.parse(text) as {
      error?: string
      code?: string
      commitSha?: string
      note?: string
      content?: unknown
    }
  } catch {
    return { error: "Draft storage could not be reached. Nothing was saved." }
  }
}

export function AdminContent() {
  const [params] = useSearchParams()
  const requestedPage = params.get("page")
  const [content, setContent] = useState<SiteContent>(() => structuredClone(publishedContent))
  const [pageId, setPageId] = useState(requestedPage && pageById(requestedPage) ? requestedPage : "home")
  const [sectionId, setSectionId] = useState("home-hero")
  const [draftId, setDraftId] = useState("working-draft")
  const [draftStatus, setDraftStatus] = useState<string | null>(null)
  const [issues, setIssues] = useState<SiteContentIssue[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [githubMissing, setGithubMissing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [commitSha, setCommitSha] = useState<string | null>(null)
  const [snapshot, setSnapshot] = useState(() => JSON.stringify(publishedContent))
  const dirty = useMemo(() => JSON.stringify(content) !== snapshot, [content, snapshot])

  const page = pageById(pageId) ?? EDITOR_PAGES[0]
  const sections = useMemo(() => sectionsForPage(page.id), [page.id])
  const section = sections.find((item) => item.id === sectionId) ?? sections[0]

  useEffect(() => {
    const requested = params.get("page")
    const requestedSection = params.get("section") ?? undefined
    if (requested && pageById(requested)) choosePage(requested, requestedSection)
    const sha = params.get("version")
    if (!sha || !/^[a-f0-9]{7,40}$/i.test(sha)) return
    void (async () => {
      const response = await fetch(`/api/content/history?sha=${encodeURIComponent(sha)}`, { credentials: "include" })
      const body = await readBody(response)
      if (!response.ok) {
        setError(failureMessage(response.status, body))
        if (response.status === 503 || body.code === "github_token_missing") setGithubMissing(true)
        return
      }
      const loaded = contentFromDraftPayload({ draft: { status: "historical", content: body.content } })
      if (!loaded.ok) {
        setError(loaded.message)
        return
      }
      setContent(loaded.content)
      setDraftStatus(null)
      setMessage(`Loaded published version ${sha.slice(0, 7)} into the editor. It is not live again until you publish it.`)
    })()
    // choosePage is recreated each render; the query string is the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/content/drafts", { credentials: "include" })
      const body = await readBody(response)
      if (response.status === 503 || body.code === "github_token_missing") {
        setGithubMissing(true)
        setError(failureMessage(response.status, body))
      }
    })()
  }, [])

  const choosePage = (nextPageId: string, nextSectionId?: string) => {
    setPageId(nextPageId)
    const nextSections = sectionsForPage(nextPageId)
    const match = nextSectionId && nextSections.some((item) => item.id === nextSectionId) ? nextSectionId : nextSections[0]?.id
    setSectionId(match ?? "")
    setPreviewing(false)
    setReviewing(false)
  }

  const onField = (item: EditorField, value: string) => {
    setContent((current) => editField(current, item.path, value))
    setPreviewing(false)
  }

  const validateCurrent = () => {
    const prepared = prepareContentForSave(content)
    const nextIssues = validateSiteContent(prepared)
    setIssues(nextIssues)
    return { prepared, nextIssues }
  }

  const save = async (submitForApproval: boolean) => {
    setBusy(true)
    setError(null)
    setMessage(null)
    const { prepared, nextIssues } = validateCurrent()
    if (nextIssues.length) {
      setBusy(false)
      setError("Fix the fields marked below before saving. Nothing was saved.")
      return
    }
    setContent(prepared)
    try {
      const response = await fetch("/api/content/drafts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(draftRequestBody(draftId, prepared, submitForApproval)),
      })
      const body = await readBody(response)
      if (!response.ok) throw new Error(failureMessage(response.status, body))
      const saved = successMessage(submitForApproval ? "approval" : "draft", body)
      if (!saved) throw new Error("GitHub did not return a commit, so this draft was not saved. The live site is unchanged.")
      setDraftStatus(submitForApproval ? "pending_approval" : "draft")
      setCommitSha(body.commitSha ?? null)
      setSnapshot(JSON.stringify(prepared))
      setGithubMissing(false)
      setMessage(saved)
    } catch (err) {
      const text = err instanceof Error ? err.message : "Could not save the draft."
      if (text.includes("GitHub content token") || text.includes("not configured")) setGithubMissing(true)
      setError(text)
    } finally {
      setBusy(false)
    }
  }

  const onSaveDraft = (event: FormEvent) => {
    event.preventDefault()
    void save(false)
  }

  const onPublish = async () => {
    const confirmed = window.confirm(
      "Publish the content in this editor? This writes the public content file on the review branch only. The live production site stays unchanged.",
    )
    if (!confirmed) return
    setBusy(true)
    setError(null)
    setMessage(null)
    const { prepared, nextIssues } = validateCurrent()
    if (nextIssues.length) {
      setBusy(false)
      setError("Fix the fields marked below before publishing. Nothing was published.")
      return
    }
    setContent(prepared)
    try {
      const response = await fetch("/api/content/publish", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(publishRequestBody(prepared)),
      })
      const body = await readBody(response)
      if (!response.ok) throw new Error(failureMessage(response.status, body))
      const saved = successMessage("publish", body)
      if (!saved) throw new Error("GitHub did not return a commit, so nothing was published.")
      setCommitSha(body.commitSha ?? null)
      setSnapshot(JSON.stringify(prepared))
      setDraftStatus("published_commit")
      setMessage(saved)
    } catch (err) {
      const text = err instanceof Error ? err.message : "Publish failed."
      if (text.includes("GitHub content token") || text.includes("not configured")) setGithubMissing(true)
      setError(text)
    } finally {
      setBusy(false)
    }
  }

  const onLoadDraft = async () => {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch(`/api/content/drafts?id=${encodeURIComponent(draftId)}`, { credentials: "include" })
      const body = await readBody(response)
      if (!response.ok) throw new Error(failureMessage(response.status, body))
      const loaded = contentFromDraftPayload(body)
      if (!loaded.ok) throw new Error(loaded.message)
      setContent(loaded.content)
      setSnapshot(JSON.stringify(loaded.content))
      setDraftStatus(loaded.status)
      setReviewing(false)
      setMessage(`Loaded draft “${draftId}” (${loaded.status}). The live site is unchanged.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load that draft.")
    } finally {
      setBusy(false)
    }
  }

  const onUsePublished = () => {
    const fresh = structuredClone(publishedContent)
    setContent(fresh)
    setSnapshot(JSON.stringify(fresh))
    setCommitSha(null)
    setDraftStatus(null)
    setIssues([])
    setPreviewing(false)
    setReviewing(false)
    setMessage("Showing the published content bundled with this site. Unsaved edits were cleared.")
  }

  const approveAndPublish = () => {
    if (draftStatus !== "pending_approval") {
      setError("Submit this draft for approval before using Approve and publish. Nothing was published.")
      return
    }
    void onPublish()
  }

  const changes = reviewing ? reviewContentChanges(content, publishedContent) : []
  const sectionIssues = section ? issuesForSection(content, section, issues) : []

  return (
    <div className="admin-page">
      <PageMeta title="Website Pages | Albany High School Bowling" description="Authenticated content editor for WAHSB." />
      <div className="admin-page__intro">
        <h2>Website management</h2>
        <p>
          Every public page is listed here. Choose a page, then a section. Saving a draft keeps it separate from the live
          site. Publishing is limited to the super administrator and writes the existing content file through GitHub.
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

      <div className="admin-editor">
        <div className="admin-editor__pages" role="list" aria-label="Website pages">
          {EDITOR_PAGES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === page.id ? "is-selected" : undefined}
              onClick={() => choosePage(item.id)}
            >
              <span className="admin-editor__title">{item.label}</span>
              <span className="admin-editor__route">{item.route}</span>
              <small className="admin-editor__badge">{item.coverageLabel}</small>
            </button>
          ))}
        </div>

        <form className="admin-panel-form" onSubmit={onSaveDraft}>
          <p className="admin-help">
            {page.label} · {page.route} · {page.coverageLabel}
          </p>
          <p>{page.summary}</p>
          <label>
            Section
            <select value={section?.id ?? ""} onChange={(event) => setSectionId(event.target.value)}>
              {sections.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          {section && (
            <>
              <h3>{section.label}</h3>
              <p className="admin-help">{section.help}</p>
              {section.custom === "bowler-profiles" ? (
                <BowlerProfileEditor content={content} onChange={setContent} />
              ) : section.lockedReason ? (
                <p className="admin-alert" role="status">
                  {section.lockedReason}
                </p>
              ) : (
                section.fields.map((item) => (
                  <label key={item.path}>
                    <span className="admin-label">
                      {item.label}
                      <StaffHelp
                        label={item.label}
                        text={`${item.help || `Edits ${item.label}.`} Visitors see it on ${page.label} only after an approved publish and a finished Netlify deploy. Saving a draft does not change the live site.`}
                      />
                    </span>
                    {item.kind === "textarea" || item.kind === "lines" ? (
                      <textarea
                        value={fieldText(content, item)}
                        onChange={(event) => onField(item, event.target.value)}
                        rows={item.kind === "lines" ? 6 : 4}
                      />
                    ) : (
                      <input
                        value={fieldText(content, item)}
                        onChange={(event) => onField(item, event.target.value)}
                      />
                    )}
                    {item.help && <span className="admin-help">{item.help}</span>}
                    {item.kind === "lines" && <span className="admin-help">One item per line.</span>}
                  </label>
                ))
              )}
              {section.custom === "faq" || section.custom === "resources" || section.custom === "sponsors" || section.custom === "donation-faq" ? (
                <LibraryEditor mode={section.custom} content={content} onChange={setContent} />
              ) : null}
              {sectionIssues.map((issue) => (
                <p key={`${issue.path}:${issue.message}`} className="admin-alert admin-alert--error" role="alert">
                  {issue.message}
                </p>
              ))}
            </>
          )}

          <label>
            Draft name
            <input value={draftId} onChange={(event) => setDraftId(event.target.value)} required pattern="[A-Za-z0-9_-]+" />
          </label>
          <p className="admin-help">
            {draftStatus
              ? `This browser is editing a loaded draft (${draftStatus}).`
              : "This browser is editing the published copy. The live site does not change until you publish."}
          </p>
          <PublishStatus dirty={dirty} draftStatus={draftStatus} commitSha={commitSha} />
          <p className="admin-help">
            Unsaved changes stay in this browser. A saved draft is a GitHub commit for the draft only. The public site changes after Publish returns a commit and Netlify finishes deploying that commit.
          </p>
          <div className="admin-form__actions">
            <StaffAction label="Save draft" help="Save your current changes as a draft. Your public website will not change." type="submit" busy={busy} disabled={githubMissing} disabledReason={githubMissing ? "GitHub publishing is not configured, so nothing can be saved." : undefined} />
            <StaffAction label="Submit for approval" help="Send this saved draft to an authorized reviewer. This does not publish it." busy={busy} disabled={githubMissing} disabledReason={githubMissing ? "GitHub publishing is not configured, so the draft cannot be submitted." : undefined} onClick={() => void save(true)} />
            <StaffAction label="Preview" help="See the selected section before publishing. Previewing does not change the public site." onClick={() => setPreviewing(true)} />
            <StaffAction label="Review changes" help="Compare this editor with the published copy. Reviewing does not save or publish." onClick={() => setReviewing(true)} />
            <StaffAction label="Approve and publish" help="Publish a draft that was submitted for approval. The save stays on the review branch. The live production site stays unchanged." busy={busy} disabled={githubMissing || draftStatus !== "pending_approval"} disabledReason={githubMissing ? "GitHub publishing is not configured." : "Submit this draft for approval before approving it."} onClick={approveAndPublish} />
            <StaffAction label="Publish" help="Make the approved changes available on the public AHSB website after GitHub confirms the commit and Netlify deploys it." busy={busy} disabled={githubMissing} disabledReason={githubMissing ? "GitHub publishing is not configured, so nothing can be published." : undefined} onClick={() => void onPublish()} />
            <StaffAction label="View history" help="Open published content commits. Loading one does not make it live." href="/admin/history" />
            <StaffAction label="Restore previous version" help="Load an older published version into the editor. It is not live again until you publish it and Netlify deploys that commit." href="/admin/history" />
            <StaffAction label="Load saved draft" help="Load the latest saved draft from the content system. Unsaved changes may be replaced." busy={busy} disabled={githubMissing} disabledReason={githubMissing ? "GitHub publishing is not configured, so no draft can be loaded." : undefined} onClick={() => void onLoadDraft()} />
            <StaffAction label="Show published copy" help="Display the version currently published with this site. Unsaved edits in this browser are cleared." onClick={onUsePublished} />
          </div>
          <p className="admin-help">
            <Link className="admin-editor__live" to={page.route}>
              Open the published {page.label} page
            </Link>
            . That link shows the live site, not this draft.
          </p>
        </form>
      </div>

      {reviewing && (
        <section className="admin-preview" aria-label="Review changes">
          <p className="admin-preview__banner">Review only. Nothing is published from this list.</p>
          {changes.length === 0 ? (
            <p>No differences from the published content bundled with this site.</p>
          ) : (
            <ul className="admin-section-list">
              {changes.map((change) => (
                <li key={`${change.label}:${change.before}:${change.after}`} className="admin-section-list__item">
                  <div>
                    <h3>{change.label}</h3>
                    <p>
                      Published: {change.before}
                      <br />
                      Editor: {change.after}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {previewing && section && (
        <section className="admin-preview" aria-label={DRAFT_PREVIEW_LABEL}>
          <p className="admin-preview__banner">{DRAFT_PREVIEW_LABEL}</p>
          <h3>{section.label}</h3>
          {section.fields.length === 0 ? (
            <p>{section.lockedReason}</p>
          ) : (
            <dl>
              {section.fields.map((item) => (
                <div key={item.path}>
                  <dt>{item.label}</dt>
                  <dd>{fieldText(content, item) || "(empty)"}</dd>
                </div>
              ))}
            </dl>
          )}
          <p>Previewing does not publish and does not make this draft public.</p>
        </section>
      )}

      {issues.length > 0 && (
        <ul className="admin-section-list">
          {issues.map((issue) => (
            <li key={`${issue.path}:${issue.message}`} className="admin-section-list__item">
              <div>
                <h3>{issue.path || "Content"}</h3>
                <p>{issue.message}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <details className="admin-advanced" open={githubMissing}>
        <summary>GitHub publishing setup</summary>
        <ol>
          {GITHUB_SETUP_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </details>

    </div>
  )
}
