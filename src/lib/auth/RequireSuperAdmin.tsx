import { useEffect, useState, type ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "./AuthProvider"
import { fetchAdminSession, type AdminSession } from "./session"

/**
 * Client gate plus server session check. CDN Role redirects are an additional
 * layer on Netlify; this component covers Vite preview and defense in depth.
 */
export function RequireSuperAdmin({ children }: { children: ReactNode }) {
  const { loading, user, logout } = useAuth()
  const location = useLocation()
  const [session, setSession] = useState<AdminSession | null>(null)
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
      const result = await fetchAdminSession()
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
    return <Navigate to="/staff/login" replace state={{ from: location.pathname, reason: session.reason, detail: session.detail }} />
  }

  return children
}
