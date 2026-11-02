import { useMemo, useState } from "react"
import { PageMeta } from "../../components/PageMeta"
import { StaffAction } from "../../components/staff/StaffAction"
import { StaffHelp } from "../../components/staff/StaffHelp"
import published from "../../content/published/siteContent.json"
import {
  CODE_ONLY_SETTINGS,
  PUBLIC_ROUTES,
  filterLinks,
  managedLinks,
  validateLinkDestination,
} from "../../lib/content/linkInventory"
import {
  GITHUB_SETUP_STEPS,
  draftRequestBody,
  editField,
  failureMessage,
  prepareContentForSave,
  publishRequestBody,
  successMessage,
} from "../../lib/content/pageEditor"
import { parseSiteContent, validateSiteContent, type SiteContent } from "../../lib/content/siteContent"

const publishedContent = parseSiteContent(published)

export function AdminLinks() {
  const [content, setContent] = useState<SiteContent>(() => structuredClone(publishedContent))
  const [query, setQuery] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [githubMissing, setGithubMissing] = useState(false)
  const [preview, setPreview] = useState(false)
  const links = useMemo(() => filterLinks(managedLinks(content), query), [content, query])
  const missingReason = githubMissing ? "GitHub publishing is not configured, so this cannot be saved." : undefined

  const update = (path: string, value: string, kind: "internal" | "external") => {
    const checked = validateLinkDestination(value, kind)
    if (!checked.ok && value.trim()) {
      setError(checked.message)
      return
    }
    setError(null)
    setContent((current) => editField(current, path, value))
    setPreview(false)
  }

  const save = async (submitForApproval: boolean) => {
    setBusy(true)
    setError(null)
    setMessage(null)
    const prepared = prepareContentForSave(content)
    const issues = validateSiteContent(prepared)
    if (issues.length) {
      setBusy(false)
      setError(issues[0]?.message || "Fix the links before saving. Nothing was saved.")
      return
    }
    try {
      const response = await fetch("/api/content/drafts", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(draftRequestBody("website-links", prepared, submitForApproval)),
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
      setGithubMissing(false)
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
    if (!window.confirm("Publish these links? GitHub must confirm the commit. The public site changes only after Netlify deploys that commit.")) return
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
      const text = err instanceof Error ? err.message : "Publish failed."
      if (text.includes("not configured") || text.includes("GitHub")) setGithubMissing(true)
      setError(text)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-page">
      <PageMeta title="Website Links | Albany High School Bowling" description="Edit public AHSB links." />
      <div className="admin-page__intro">
        <h2>
          Website Links and Navigation <StaffHelp label="Website links" text="Edits the public menu, buttons, and other links stored in the website content. Visitors see a change only after publish and a finished Netlify deploy. This screen cannot point a public link at staff, payment, or system pages." />
        </h2>
        <p>Unsaved changes stay in this browser. A saved draft is a GitHub commit for the draft only. It is not the live website.</p>
      </div>
      {error ? <p className="admin-alert admin-alert--error" role="alert">{error}</p> : null}
      {message ? <p className="admin-alert" role="status">{message}</p> : null}
      <label>
        Search links
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by label, page, or destination" />
      </label>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Location</th>
              <th>Link label</th>
              <th>Destination</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr key={link.id}>
                <td>{link.location}</td>
                <td>
                  {link.labelPath.endsWith(".label") || link.labelPath.endsWith("Label") ? (
                    <input aria-label={`${link.location} label`} value={link.label} onChange={(event) => setContent((current) => editField(current, link.labelPath, event.target.value))} />
                  ) : (
                    link.label
                  )}
                </td>
                <td>
                  {link.kind === "internal" ? (
                    <>
                      <select aria-label={`${link.label} destination`} value={PUBLIC_ROUTES.includes(link.destination as (typeof PUBLIC_ROUTES)[number]) ? link.destination : ""} onChange={(event) => update(link.destinationPath, event.target.value, "internal")}>
                        <option value="">Choose a page</option>
                        {PUBLIC_ROUTES.map((route) => (
                          <option key={route} value={route}>{route}</option>
                        ))}
                      </select>
                      <input aria-label={`${link.label} custom path`} value={link.destination} onChange={(event) => update(link.destinationPath, event.target.value, "internal")} />
                    </>
                  ) : (
                    <input aria-label={`${link.label} destination`} value={link.destination} onChange={(event) => update(link.destinationPath, event.target.value, "external")} placeholder="https://" />
                  )}
                </td>
                <td>{link.destination ? "In this editor" : "Empty"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="admin-form__actions">
        <StaffAction label="Save draft" help="Save these link changes as a draft. The public website will not change." busy={busy} disabled={githubMissing} disabledReason={missingReason} type="button" onClick={() => void save(false)} />
        <StaffAction label="Submit for approval" help="Send this draft to the super administrator. This does not publish it." busy={busy} disabled={githubMissing} disabledReason={missingReason} onClick={() => void save(true)} />
        <StaffAction label="Preview" help="Show the destinations currently in this editor. Previewing does not publish." onClick={() => setPreview(true)} />
        <StaffAction label="Publish" help="Write the approved links to the public content file. The live site updates only after Netlify deploys the GitHub commit." busy={busy} disabled={githubMissing} disabledReason={missingReason} onClick={() => void publish()} />
      </div>
      {preview ? (
        <section className="admin-preview" aria-label="Link preview">
          <p className="admin-preview__banner">DRAFT PREVIEW — NOT PUBLISHED</p>
          <ul>
            {links.map((link) => (
              <li key={`preview-${link.id}`}>{link.label || "(no label)"} → {link.destination || "(empty)"} · {link.appearsOn}</li>
            ))}
          </ul>
        </section>
      ) : null}
      <h3>Still controlled outside this screen</h3>
      <ul className="admin-section-list">
        {CODE_ONLY_SETTINGS.map((item) => (
          <li key={item.name} className="admin-section-list__item">
            <div>
              <h3>{item.name}</h3>
              <p>{item.reason}</p>
            </div>
          </li>
        ))}
      </ul>
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
