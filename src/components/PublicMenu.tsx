import { useEffect, useRef } from "react"
import { NavLink } from "react-router-dom"
import { groupPublicNav, type PublicNavItem } from "../lib/nav/publicMenu"

export function PublicMenu({
  id,
  open,
  items,
  onClose,
}: {
  id: string
  open: boolean
  items: readonly PublicNavItem[]
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const groups = groupPublicNav(items)

  useEffect(() => {
    if (!open) return
    const dialog = dialogRef.current
    const focusable = () =>
      Array.from(dialog?.querySelectorAll<HTMLElement>("a, button") ?? []).filter((item) => !item.hasAttribute("disabled"))
    focusable()[0]?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== "Tab") return
      const nodes = focusable()
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="public-drawer">
      <button type="button" className="public-drawer__backdrop" aria-label="Close menu" onClick={onClose} />
      <div
        ref={dialogRef}
        id={id}
        className="public-drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
      >
        <div className="public-drawer__bar">
          <p>AHSB</p>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <nav aria-label="Primary">
          {groups.map((group) => (
            <section key={group.id}>
              <h2>{group.title}</h2>
              <ul>
                {group.links.map((item) => (
                  <li key={item.to}>
                    {item.openInNewTab ? (
                      <a href={item.to} target="_blank" rel="noopener noreferrer" onClick={onClose}>
                        {item.label}
                        <span className="visually-hidden"> (opens in a new tab)</span>
                      </a>
                    ) : (
                      <NavLink to={item.to} end={item.end} onClick={onClose}>
                        {item.label}
                      </NavLink>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </nav>
      </div>
    </div>
  )
}
