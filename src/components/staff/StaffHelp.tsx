import { useId, useState } from "react"

/**
 * Staff-only explanation. Open with click, tap, or keyboard focus.
 * Do not render this on public pages.
 */
export function StaffHelp({ label, text }: { label: string; text: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <span className="staff-help">
      <button
        type="button"
        className="staff-help__button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`Help: ${label}`}
        onClick={() => setOpen((current) => !current)}
        onFocus={() => setOpen(true)}
        onBlur={(event) => {
          if (!event.currentTarget.parentElement?.contains(event.relatedTarget)) setOpen(false)
        }}
      >
        ?
      </button>
      <span id={id} role="tooltip" className={open ? "staff-help__popover is-open" : "staff-help__popover"} hidden={!open}>
        {text}
      </span>
    </span>
  )
}
