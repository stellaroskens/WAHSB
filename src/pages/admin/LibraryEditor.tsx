import { useState } from "react"
import { StaffHelp } from "../../components/staff/StaffHelp"
import { validateLinkDestination } from "../../lib/content/linkInventory"
import type { LibraryFaqItem, LibraryListing, SiteContent } from "../../lib/content/siteContent"

const help = "Visitors see this only after an approved publish and a finished Netlify deploy. Saving a draft does not change the live site. This does not send email or turn on payments."

function move<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const next = index + direction
  if (next < 0 || next >= items.length) return items
  const copy = items.slice()
  const [item] = copy.splice(index, 1)
  copy.splice(next, 0, item)
  return copy
}

export function LibraryEditor({
  mode,
  content,
  onChange,
}: {
  mode: "faq" | "resources"
  content: SiteContent
  onChange: (content: SiteContent) => void
}) {
  const [categoryIndex, setCategoryIndex] = useState(0)
  const [itemIndex, setItemIndex] = useState(0)
  const [group, setGroup] = useState<"proShops" | "bowlingCenters">("proShops")
  const [error, setError] = useState<string | null>(null)

  if (mode === "faq") {
    const categories = content.library.faq.categories
    const category = categories[Math.min(categoryIndex, categories.length - 1)]
    const item = category?.items[Math.min(itemIndex, (category?.items.length ?? 1) - 1)]
    const updateItem = (patch: Partial<LibraryFaqItem>) => {
      const next = structuredClone(content)
      const target = next.library.faq.categories[categoryIndex]?.items[itemIndex]
      if (!target) return
      Object.assign(target, patch)
      onChange(next)
    }
    return (
      <div className="library-editor">
        <label>
          <span className="admin-label">
            FAQ category
            <StaffHelp label="FAQ category" text={`Chooses which group of questions to edit. The group title appears as a heading on the FAQ page. ${help}`} />
          </span>
          <select value={categoryIndex} onChange={(event) => { setCategoryIndex(Number(event.target.value)); setItemIndex(0) }}>
            {categories.map((entry, index) => (
              <option key={entry.id} value={index}>{entry.title}</option>
            ))}
          </select>
        </label>
        {category ? (
          <label>
            <span className="admin-label">Category title <StaffHelp label="Category title" text={`Changes the heading for this group on the public FAQ page. ${help}`} /></span>
            <input value={category.title} onChange={(event) => {
              const next = structuredClone(content)
              next.library.faq.categories[categoryIndex].title = event.target.value
              onChange(next)
            }} />
          </label>
        ) : null}
        <div className="library-editor__list">
          {category?.items.map((entry, index) => (
            <button key={`${entry.question}-${index}`} type="button" className={index === itemIndex ? "is-selected" : undefined} onClick={() => setItemIndex(index)}>
              {index + 1}. {entry.hidden ? "Hidden: " : ""}{entry.question || "Untitled question"}
            </button>
          ))}
        </div>
        {item ? (
          <>
            <label>
              <span className="admin-label">Question <StaffHelp label="Question" text={`Changes this question on the FAQ page, and on Practices or Tournaments when that page reuses the category. ${help}`} /></span>
              <input value={item.question} onChange={(event) => updateItem({ question: event.target.value })} />
            </label>
            <label>
              <span className="admin-label">Answer paragraphs <StaffHelp label="Answer" text={`One paragraph per line. This is the public answer. It does not send a message. ${help}`} /></span>
              <textarea rows={6} value={item.paragraphs.join("\n")} onChange={(event) => updateItem({ paragraphs: event.target.value.split("\n").filter((line) => line.trim()) })} />
            </label>
            <label>
              <span className="admin-label">Bullet points <StaffHelp label="Bullet points" text="Optional extra points under the answer. Leave blank if this answer has none." /></span>
              <textarea rows={3} value={(item.points ?? []).join("\n")} onChange={(event) => {
                const points = event.target.value.split("\n").map((line) => line.trim()).filter(Boolean)
                updateItem({ points: points.length ? points : undefined })
              }} />
            </label>
            <label>
              <span className="admin-label">Related link label</span>
              <input value={item.links?.[0]?.label ?? ""} onChange={(event) => {
                const href = item.links?.[0]?.href ?? "/contact"
                updateItem({ links: event.target.value.trim() ? [{ href, label: event.target.value }] : undefined })
              }} />
            </label>
            <label>
              <span className="admin-label">Related link destination <StaffHelp label="FAQ link" text="Internal paths stay on this site. External links must use https. Staff and script links are rejected." /></span>
              <input value={item.links?.[0]?.href ?? ""} onChange={(event) => {
                const value = event.target.value.trim()
                if (!value) {
                  updateItem({ links: undefined })
                  setError(null)
                  return
                }
                const kind = value.startsWith("/") ? "internal" : "external"
                const checked = validateLinkDestination(value, kind)
                if (!checked.ok) {
                  setError(checked.message)
                  return
                }
                setError(null)
                updateItem({ links: [{ href: checked.destination, label: item.links?.[0]?.label || "Learn more" }] })
              }} />
            </label>
            {error ? <p className="admin-alert admin-alert--error" role="alert">{error}</p> : null}
            <div className="admin-form__actions">
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => {
                const next = structuredClone(content)
                next.library.faq.categories[categoryIndex].items = move(category.items, itemIndex, -1)
                onChange(next)
                setItemIndex(Math.max(0, itemIndex - 1))
              }}>Move up</button>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => {
                const next = structuredClone(content)
                next.library.faq.categories[categoryIndex].items = move(category.items, itemIndex, 1)
                onChange(next)
                setItemIndex(Math.min(category.items.length - 1, itemIndex + 1))
              }}>Move down</button>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => updateItem({ hidden: !item.hidden })}>
                {item.hidden ? "Show question" : "Hide question"}
              </button>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => {
                if (!window.confirm("Remove this question from the editor? It leaves the public page only after you publish.")) return
                const next = structuredClone(content)
                next.library.faq.categories[categoryIndex].items.splice(itemIndex, 1)
                onChange(next)
                setItemIndex(0)
              }}>Remove question</button>
            </div>
          </>
        ) : null}
      </div>
    )
  }

  const listings = content.library.resources[group]
  const listing = listings[Math.min(itemIndex, listings.length - 1)]
  const updateListing = (patch: Partial<LibraryListing>) => {
    const next = structuredClone(content)
    const target = next.library.resources[group][itemIndex]
    if (!target) return
    Object.assign(target, patch)
    onChange(next)
  }

  return (
    <div className="library-editor">
      <label>
        <span className="admin-label">Directory <StaffHelp label="Directory" text={`Pro shops and bowling centers are the two public directories on Bowling Resources. ${help}`} /></span>
        <select value={group} onChange={(event) => { setGroup(event.target.value as "proShops" | "bowlingCenters"); setItemIndex(0) }}>
          <option value="proShops">Bowling pro shops</option>
          <option value="bowlingCenters">Bowling alleys and centers</option>
        </select>
      </label>
      <label>
        <span className="admin-label">Listing</span>
        <select value={Math.min(itemIndex, listings.length - 1)} onChange={(event) => setItemIndex(Number(event.target.value))}>
          {listings.map((entry, index) => (
            <option key={entry.id} value={index}>{entry.hidden ? "Hidden: " : ""}{entry.name}</option>
          ))}
        </select>
      </label>
      {listing ? (
        <>
          <label><span className="admin-label">Name <StaffHelp label="Business name" text={`Changes the heading on this business card. ${help}`} /></span><input value={listing.name} onChange={(event) => updateListing({ name: event.target.value })} /></label>
          <label><span className="admin-label">City</span><input value={listing.city} onChange={(event) => updateListing({ city: event.target.value })} /></label>
          <label><span className="admin-label">Address</span><input value={listing.address ?? ""} onChange={(event) => updateListing({ address: event.target.value || undefined })} /></label>
          <label><span className="admin-label">Phone</span><input value={listing.phone ?? ""} onChange={(event) => updateListing({ phone: event.target.value || undefined })} /></label>
          <label>
            <span className="admin-label">Website <StaffHelp label="Business website" text="Must be an https link. The public card opens it in a new tab. A script link is rejected." /></span>
            <input value={listing.website ?? ""} onChange={(event) => {
              const value = event.target.value.trim()
              if (!value) {
                updateListing({ website: undefined })
                setError(null)
                return
              }
              const checked = /^https?:\/\/[^\s]+$/.test(value) && !/^(javascript|data|vbscript):/i.test(value)
                ? { ok: true as const, destination: value }
                : validateLinkDestination(value, "external")
              if (!checked.ok) {
                setError(checked.message)
                return
              }
              setError(null)
              updateListing({ website: checked.destination })
            }} />
          </label>
          <label><span className="admin-label">Description points <StaffHelp label="Description" text="One point per line. These appear as the public description under the business name." /></span><textarea rows={4} value={listing.points.join("\n")} onChange={(event) => updateListing({ points: event.target.value.split("\n").map((line) => line.trim()).filter(Boolean) })} /></label>
          {error ? <p className="admin-alert admin-alert--error" role="alert">{error}</p> : null}
          <div className="admin-form__actions">
            <button type="button" className="admin-btn admin-btn--ghost" onClick={() => {
              const next = structuredClone(content)
              next.library.resources[group] = move(listings, itemIndex, -1)
              onChange(next)
              setItemIndex(Math.max(0, itemIndex - 1))
            }}>Move up</button>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={() => {
              const next = structuredClone(content)
              next.library.resources[group] = move(listings, itemIndex, 1)
              onChange(next)
              setItemIndex(Math.min(listings.length - 1, itemIndex + 1))
            }}>Move down</button>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={() => updateListing({ hidden: !listing.hidden })}>{listing.hidden ? "Show listing" : "Hide listing"}</button>
          </div>
          <p className="admin-help">Hiding a listing removes it from the public page after publish. The record stays here so it can be shown again.</p>
        </>
      ) : null}
    </div>
  )
}
