import type { ReactNode } from "react"

type EmptyStateProps = {
  title: string
  children: ReactNode
}

export function EmptyState({ title, children }: EmptyStateProps) {
  return (
    <div className="empty" role="status">
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  )
}
