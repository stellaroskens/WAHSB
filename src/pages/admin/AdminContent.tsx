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
  sectionsForPage,
  successMessage,
  type EditorField,
} from "../../lib/content/pageEditor"
import { parseSiteContent, validateSiteContent, type SiteContent, type SiteContentIssue } from "../../lib/content/siteContent"

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
  const [rawText, setRawText] = useState("")
  const [rawDirty, setRawDirty] = useState(false)

  const page = pageById(pageId) ?? EDITOR_PAGES[0]
  const sections = useMemo(() => sectionsForPage(page.id), [page.id])
  const section = sections.find((item) => item.id === sectionId) ?? sections[0]

  useEffect(() => {
    if (!rawDirty) setRawText(JSON.stringify(content, null, 2))
  }, [content, rawDirty])

  useEffect(() => {
    const requested = params.get("page")
    if (requested && pageById(requested)) choosePage(requested)
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

  const choosePage = (nextPageId: string) => {
    setPageId(nextPageId)
    const nextSections = sectionsForPage(nextPageId)
    setSectionId(nextSections[0]?.id ?? "")
    setPreviewing(false)
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
      "Publish the content in this editor? This writes the public content file in GitHub. The live site changes only after Netlify finishes deploying that commit.",
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
      setDraftStatus(loaded.status)
      setRawDirty(false)
      setMessage(`Loaded draft “${draftId}” (${loaded.status}). The live site is unchanged.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load that draft.")
    } finally {
      setBusy(false)
    }
  }

  const onUsePublished = () => {
    setContent(structuredClone(publishedContent))
    setDraftStatus(null)
    setIssues([])
    setRawDirty(false)
    setPreviewing(false)
    setMessage("Showing the published content bundled with this site. Unsaved edits were cleared.")
  }

  const onApplyRaw = () => {
    try {
      const parsed = JSON.parse(rawText) as unknown
      const nextIssues = validateSiteContent(parsed)
      setIssues(nextIssues)
      if (nextIssues.length) {
        setError("The raw content file has validation errors, so it was not applied.")
        return
      }
      setContent(parseSiteContent(parsed))
      setRawDirty(false)
      setError(null)
      setMessage("Raw content applied to the form. It is not saved until you save a draft or publish.")
    } catch {
      setError("That text is not valid JSON. The form was not changed.")
    }
  }

  const sectionIssues = section ? issuesForSection(content, section, issues) : []

  return (
    <div className="admin-page">
      <PageMeta title="Website Pages | Albany High School Bowling" description="Authenticated content editor for WAHSB." />
      <div className="admin-page__intro">
        <h2>Website Pages</h2>
        <p>
          Choose a page, then a section. Saving a draft keeps it separate from the live site. Publishing is limited to
          the super administrator and writes the existing content file through GitHub.
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
              <span>{item.label}</span>
              <small>{item.coverageLabel}</small>
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
              {section.lockedReason ? (
                <p className="admin-alert" role="status">
                  {section.lockedReason}
                </p>
              ) : (
                section.fields.map((item) => (
                  <label key={item.path}>
                    {item.label}
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
          <div className="admin-form__actions">
            <button className="admin-btn" type="submit" disabled={busy}>
              {busy ? "Working…" : "Save draft"}
            </button>
            <button className="admin-btn admin-btn--ghost" type="button" disabled={busy} onClick={() => void save(true)}>
              Submit for approval
            </button>
            <button className="admin-btn admin-btn--ghost" type="button" disabled={busy} onClick={() => setPreviewing(true)}>
              Preview
            </button>
            <button className="admin-btn admin-btn--ghost" type="button" disabled={busy} onClick={() => void onPublish()}>
              Publish
            </button>
            <button className="admin-btn admin-btn--ghost" type="button" disabled={busy} onClick={() => void onLoadDraft()}>
              Load saved draft
            </button>
            <button className="admin-btn admin-btn--ghost" type="button" disabled={busy} onClick={onUsePublished}>
              Show published copy
            </button>
          </div>
          <p className="admin-help">
            <Link className="admin-editor__live" to={page.route}>
              Open the published {page.label} page
            </Link>
            . That link shows the live site, not this draft.
          </p>
        </form>
      </div>

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

      <details className="admin-advanced">
        <summary>Advanced: raw content file</summary>
        <p className="admin-help">Ordinary editing uses the fields above. Apply JSON only if you need the whole file.</p>
        <textarea
          className="admin-code"
          rows={12}
          value={rawText}
          spellCheck={false}
          onChange={(event) => {
            setRawText(event.target.value)
            setRawDirty(true)
          }}
        />
        <button className="admin-btn admin-btn--ghost" type="button" onClick={onApplyRaw}>
          Apply JSON to the form
        </button>
      </details>
    </div>
  )
}
