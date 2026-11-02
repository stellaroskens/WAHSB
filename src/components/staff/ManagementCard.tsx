import type { ReactNode } from "react"
import { Link } from "react-router-dom"

export function ManagementCard({
  href,
  title,
  description,
  status,
  icon,
}: {
  href: string
  title: string
  description: string
  status?: string
  icon?: ReactNode
}) {
  return (
    <Link className="dash-card" to={href}>
      <span className="dash-card__icon" aria-hidden="true">
        {icon ?? title.slice(0, 1)}
      </span>
      <span className="dash-card__body">
        <span className="dash-card__title">{title}</span>
        <span className="dash-card__copy">{description}</span>
        {status ? <span className="dash-card__status">{status}</span> : null}
      </span>
      <span className="dash-card__arrow" aria-hidden="true">
        →
      </span>
    </Link>
  )
}
