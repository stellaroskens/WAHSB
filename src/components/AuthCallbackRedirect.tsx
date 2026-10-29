import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../lib/auth/AuthProvider"

/** Route invite / recovery callbacks to the staff login surface. */
export function AuthCallbackRedirect() {
  const { callbackKind, inviteToken, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (loading) return
    if (location.pathname.startsWith("/staff/login")) return
    if (callbackKind === "invite" && inviteToken) {
      navigate("/staff/login", { replace: true })
      return
    }
    if (callbackKind === "recovery") {
      navigate("/staff/login", { replace: true })
    }
  }, [callbackKind, inviteToken, loading, location.pathname, navigate])

  return null
}
