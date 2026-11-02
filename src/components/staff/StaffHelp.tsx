import { useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"

/**
 * Staff-only explanation. Open with hover, click, tap, or keyboard focus.
 * Do not render this on public pages.
 */
export function StaffHelp({ label, text }: { label: string; text: string }) {
  const [pinned, setPinned] = useState(false)
  const [hover, setHover] = useState(false)
  const [box, setBox] = useState<{ top: number; left: number; width: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const closeTimer = useRef<number | undefined>(undefined)
  const id = useId()
  const open = pinned || hover

  function place() {
    const button = buttonRef.current
    if (!button) return
    const rect = button.getBoundingClientRect()
    const width = Math.min(360, window.innerWidth - 16)
    const labelNode = button.closest("label, .staff-action, h2, h3")
    const field = labelNode?.querySelector("input, textarea, select")
    const fieldRect = field?.getBoundingClientRect()
    let top = rect.bottom + 8
    let left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))
    const height = 132
    const coversField = Boolean(fieldRect && top < fieldRect.bottom && top + height > fieldRect.top)
    if (coversField && fieldRect) {
      const above = fieldRect.top - height - 8
      if (above > 8) top = above
      else {
        left = Math.max(8, Math.min(rect.right + 8, window.innerWidth - width - 8))
        top = Math.max(8, Math.min(rect.top, window.innerHeight - height - 8))
      }
    }
    if (top + height > window.innerHeight - 8) top = Math.max(8, rect.top - height - 8)
    setBox({ top, left, width })
  }

  useEffect(() => {
    if (!open) return
    place()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPinned(false)
        setHover(false)
      }
    }
    window.addEventListener("resize", place)
    window.addEventListener("scroll", place, true)
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("resize", place)
      window.removeEventListener("scroll", place, true)
      window.removeEventListener("keydown", onKey)
    }
  }, [open])

  function enter() {
    window.clearTimeout(closeTimer.current)
    setHover(true)
  }

  function leave() {
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setHover(false), 180)
  }

  return (
    <span className="staff-help" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        ref={buttonRef}
        type="button"
        className="staff-help__button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`Help: ${label}`}
        onClick={() => setPinned((current) => !current)}
        onFocus={enter}
        onBlur={(event) => {
          if (!event.currentTarget.parentElement?.contains(event.relatedTarget)) leave()
        }}
      >
        ?
      </button>
      {open && box
        ? createPortal(
            <span
              id={id}
              role="tooltip"
              className="staff-help__popover is-open"
              style={{ position: "fixed", top: box.top, left: box.left, width: box.width, zIndex: 30 }}
              onMouseEnter={enter}
              onMouseLeave={leave}
            >
              {text}
            </span>,
            document.body,
          )
        : null}
    </span>
  )
}
