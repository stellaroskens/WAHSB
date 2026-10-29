import { useEffect, useState, type ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "./AuthProvider"
import { dashboardPathForRole, type StaffRole } from "./roles"
import { fetchStaffSession, type StaffSession } from "./session"

export function RequireStaff({
  children,
  allow,
}: {
  children: ReactNode
  allow: StaffRole[]
}) {
  const { loading, user, logout } = useAuth()
  const location = useLocation()
  const [session, setSession] = useState<StaffSession | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      if (loading) return
      if (!user) {
        if (!cancelled) {
          setSession({ ok: false, reason: "unauthorized" })
          setChecking(false)
        }
        return
      }

      setChecking(true)
      const result = await fetchStaffSession()
      if (cancelled) return

      if (result.ok === false && result.reason === "forbidden") {
        try {
          await logout()
        } catch {
          /* ignore */
        }
      }

      setSession(result)
      setChecking(false)
    })()

    return () => {
      cancelled = true
    }
  }, [loading, user, logout])

  if (loading || checking || session === null) {
    return (
      <div className="admin-shell admin-shell--loading">
        <p>Checking staff access…</p>
      </div>
    )
  }

  if (!session.ok) {
    return <Navigate to="/staff/login" replace state={{ from: location.pathname, reason: session.reason }} />
  }

  if (!allow.includes(session.primaryRole) && session.primaryRole !== "super_admin") {
    return <Navigate to={dashboardPathForRole(session.primaryRole)} replace />
  }

  return children
}
