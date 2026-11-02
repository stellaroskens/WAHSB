import { Link } from "react-router-dom"
import { StaffHelp } from "./StaffHelp"

export function StaffAction({
  label,
  help,
  disabled = false,
  disabledReason,
  busy = false,
  type = "button",
  onClick,
  href,
}: {
  label: string
  help: string
  disabled?: boolean
  disabledReason?: string
  busy?: boolean
  type?: "button" | "submit"
  onClick?: () => void
  href?: string
}) {
  const unavailable = disabled || busy
  const reason = busy ? "This action is working. Wait for it to finish." : disabledReason
  const className = label === "Save draft" || label === "Publish" ? "admin-btn" : "admin-btn admin-btn--ghost"

  return (
    <span className="staff-action">
      {href && !unavailable ? (
        <Link className={className} to={href}>
          {label}
        </Link>
      ) : (
        <button className={className} type={type} disabled={unavailable} onClick={onClick}>
          {busy ? "Working…" : label}
        </button>
      )}
      <StaffHelp label={label} text={unavailable && reason ? `${help} Unavailable: ${reason}` : help} />
      {unavailable && reason ? <span className="staff-action__reason">{reason}</span> : null}
    </span>
  )
}
