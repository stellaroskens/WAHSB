import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "./AuthProvider"
import { decidePostLogin } from "./postLogin"
import { fetchStaffSession } from "./session"

type Status = "idle" | "checking" | "blocked"

/**
 * Once a user is signed in, ask the server which dashboard they may use and go there.
 * Any refusal is shown as a message instead of silently returning to an empty form.
 */
export function useStaffAccessCheck(enabled: boolean) {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState<Status>("idle")
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null)

  const check = useCallback(async () => {
    setStatus("checking")
    setBlockedMessage(null)
    const decision = decidePostLogin(await fetchStaffSession())
    if (decision.kind === "redirect") {
      navigate(decision.path, { replace: true })
      return
    }
    if (decision.signOut) {
      try {
        await logout()
      } catch {
        /* the message below still applies */
      }
    }
    setBlockedMessage(decision.message)
    setStatus("blocked")
  }, [logout, navigate])

  useEffect(() => {
    if (!enabled || loading || !user || status !== "idle") return
    void check()
  }, [enabled, loading, user, status, check])

  const reset = useCallback(() => {
    setStatus("idle")
    setBlockedMessage(null)
  }, [])

  const pending = enabled && !loading && Boolean(user) && status === "idle"
  return { checking: status === "checking" || pending, blockedMessage, check, reset }
}
