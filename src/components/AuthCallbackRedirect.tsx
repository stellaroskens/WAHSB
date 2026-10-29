import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../lib/auth/AuthProvider"

/** Route invite / recovery callbacks to the staff login surface. */
export function AuthCallbackRedirect() {
  const { callbackKind, callbackProblem, inviteToken, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (loading) return
    const onStaffLogin = location.pathname.startsWith("/staff/login")
    const onSignIn = location.pathname.startsWith("/sign-in")
    if (callbackProblem && !onStaffLogin && !onSignIn) {
      navigate("/sign-in", { replace: true })
      return
    }
    if (onStaffLogin) return
    if (callbackKind === "invite" && inviteToken) {
      navigate("/staff/login", { replace: true })
      return
    }
    if (callbackKind === "recovery" || callbackKind === "confirmation") {
      navigate("/staff/login", { replace: true })
    }
  }, [callbackKind, callbackProblem, inviteToken, loading, location.pathname, navigate])

  return null
}
