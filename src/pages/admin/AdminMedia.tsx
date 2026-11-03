import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import { PageMeta } from "../../components/PageMeta"
import { publicMediaItems } from "../../content/publicImages"
import { MEDIA_PLACEMENTS, OBJECT_POSITIONS, type MediaItem, type MediaRole } from "../../lib/media/publicMedia"

const BUILT_IN = [
  { label: "Website logo", path: "/brand/website-logo-480.webp", use: "Header and Our Club" },
  { label: "Homepage hero artwork", path: "/images/home-hero-banner-1280.webp", use: "Homepage and Bowl-a-thon until a library image is placed" },
  { label: "Cliff Meredith portrait", path: "/coaches/cliff-meredith-640.webp", use: "Approved coach portrait" },
  { label: "Chris Breshears portrait", path: "/coaches/chris-breshears-640.webp", use: "Approved coach portrait" },
  { label: "Burgerville flyer", path: "/images/burgerville-fundraiser.png", use: "Fundraiser page" },
  { label: "Lakeshore Lanes logo", path: "/lakeshore-lanes.avif", use: "Homepage, Practices, and Sponsors" },
]

const ROLES: { id: MediaRole; label: string }[] = [
  { id: "homepage", label: "Homepage artwork" },
  { id: "coach-portrait", label: "Coach portrait" },
  { id: "fundraiser", label: "Fundraiser banner" },
  { id: "sponsor-logo", label: "Sponsor logo" },
  { id: "page-image", label: "Other public page image" },
]

export function AdminMedia() {
  const [items, setItems] = useState<MediaItem[]>(publicMediaItems)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [alt, setAlt] = useState("")
  const [caption, setCaption] = useState("")
  const [role, setRole] = useState<MediaRole>("page-image")
  const [placement, setPlacement] = useState("")
  const [objectPosition, setObjectPosition] = useState<(typeof OBJECT_POSITIONS)[number]>("center")
  const [replacing, setReplacing] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)

  function chooseFile(next: File | null) {
    setFile(next)
    setPreview(next ? URL.createObjectURL(next) : null)
    setError(next && next.size > 1_500_000 ? "Use an image of 1.5 MB or smaller." : null)
  }

  async function send(body: Record<string, unknown>) {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const payload = (await response.json()) as { error?: string; message?: string; note?: string; items?: MediaItem[] }
      if (!response.ok) {
        setError(payload.message || payload.error || "The image was not saved.")
        return
      }
      if (payload.items) setItems(payload.items)
      setMessage(payload.note || "Saved on the review branch.")
      setFile(null)
      setPreview(null)
      setReplacing(null)
      setConfirmRemove(null)
    } catch {
      setError("The image could not be sent. Open the review preview while signed in as Super Administrator.")
    } finally {
      setBusy(false)
    }
  }

  async function onUpload(event: FormEvent) {
    event.preventDefault()
    if (!file) {
      setError("Choose an image first.")
      return
    }
    if (file.size > 1_500_000) {
      setError("Use an image of 1.5 MB or smaller.")
      return
    }
    const bytes = new Uint8Array(await file.arrayBuffer())
    let binary = ""
    for (let index = 0; index < bytes.length; index += 0x8000) {
      binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000))
    }
    await send({
      action: replacing ? "replace" : "upload",
      id: replacing,
      filename: file.name,
      alt,
      caption,
      role,
      placement: placement || null,
      objectPosition,
      data: btoa(binary),
    })
  }

  return (
    <div className="admin-page">
      <PageMeta title="Media Library | Albany High School Bowling" description="Public images for Albany High School Bowling." />
      <div className="admin-page__intro">
        <h2>Media library</h2>
        <p>
          Upload a public image here. The file is published through the server to the review branch. The browser never
          receives the GitHub token. Student and family photographs do not belong in this library.
        </p>
      </div>
      {error ? <p className="admin-alert admin-alert--error" role="alert">{error}</p> : null}
      {message ? <p className="admin-alert" role="status">{message}</p> : null}

      <form className="admin-panel-form" onSubmit={(event) => void onUpload(event)}>
        <h3>{replacing ? "Replace a library image" : "Add a public image"}</h3>
        <label>
          Image file
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
          />
        </label>
        {preview ? (
          <img className="media-preview" src={preview} alt={alt || "Selected image preview"} style={{ objectPosition }} />
        ) : null}
        <label>
          Description
          <input value={alt} onChange={(event) => setAlt(event.target.value)} required maxLength={180} />
        </label>
        <label>
          Caption
          <input value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={240} />
        </label>
        <label>
          Use
          <select value={role} onChange={(event) => setRole(event.target.value as MediaRole)}>
            {ROLES.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
        </label>
        <label>
          Page position
          <select value={placement} onChange={(event) => setPlacement(event.target.value)}>
            <option value="">Do not place it yet</option>
            {MEDIA_PLACEMENTS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Crop position
          <select value={objectPosition} onChange={(event) => setObjectPosition(event.target.value as (typeof OBJECT_POSITIONS)[number])}>
            {OBJECT_POSITIONS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <div className="admin-form__actions">
          <button className="admin-btn" type="submit" disabled={busy}>{busy ? "Saving…" : replacing ? "Replace image" : "Upload image"}</button>
          {replacing ? (
            <button className="admin-btn admin-btn--ghost" type="button" onClick={() => setReplacing(null)}>Cancel replace</button>
          ) : null}
        </div>
        <p className="admin-help">
          JPEG, PNG, WebP, GIF, and AVIF up to 1.5 MB. The public page changes after the review deploy finishes. Production is not updated from this screen. Alt text for the homepage headline is still edited in{" "}
          <Link to="/admin/content?page=home">Website Pages</Link>.
        </p>
      </form>

      <h3 className="admin-subheading">Uploaded library</h3>
      {items.length === 0 ? <p>No uploaded images are published on this build yet.</p> : null}
      <ul className="admin-section-list">
        {items.map((item) => (
          <li key={item.id} className="admin-section-list__item">
            <img src={item.path} alt={item.alt} width={160} height={90} style={{ objectFit: "cover", objectPosition: item.objectPosition }} />
            <div>
              <h3>{item.alt}</h3>
              <p>{item.path}{item.placement ? ` · ${item.placement}` : ""}{item.caption ? ` · ${item.caption}` : ""}</p>
            </div>
            <div className="admin-form__actions">
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => { setReplacing(item.id); setAlt(item.alt); setCaption(item.caption); setRole(item.role); setPlacement(item.placement ?? ""); setObjectPosition(item.objectPosition) }}>Replace</button>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => void send({ action: "assign", id: item.id, placement: placement || item.placement })}>Use selected position</button>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => {
                if (confirmRemove !== item.id) {
                  setConfirmRemove(item.id)
                  return
                }
                void send({ action: "remove", id: item.id })
              }}>{confirmRemove === item.id ? "Confirm remove" : "Remove"}</button>
            </div>
          </li>
        ))}
      </ul>

      <h3 className="admin-subheading">Already on the website</h3>
      <ul className="admin-section-list">
        {BUILT_IN.map((asset) => (
          <li key={asset.path} className="admin-section-list__item">
            <img src={asset.path} alt="" width={160} height={90} style={{ objectFit: "cover" }} />
            <div>
              <h3>{asset.label}</h3>
              <p>{asset.path} · {asset.use}</p>
            </div>
            <span className="admin-badge">Kept</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
