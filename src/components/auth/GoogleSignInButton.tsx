import { getSettings, oauthLogin } from "@netlify/identity"
import { useState } from "react"
import { decideGoogleSignIn, GOOGLE_SIGN_IN_HELP, GOOGLE_SIGN_IN_LABEL, GOOGLE_SIGN_IN_UNAVAILABLE } from "../../lib/auth/googleSignIn"

type Props = {
  variant?: "public" | "admin"
}

export function GoogleSignInButton({ variant = "public" }: Props) {
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const buttonClass = variant === "admin" ? "admin-btn admin-btn--ghost" : "button button-secondary signin-submit"
  const alertClass = variant === "admin" ? "admin-alert" : "signin-alert"
  const helpClass = variant === "admin" ? "admin-help" : "signin-help"

  async function onClick() {
    if (busy) return
    setBusy(true)
    setMessage(null)
    try {
      const settings = await getSettings()
      const decision = decideGoogleSignIn(settings)
      if (decision.action === "blocked") {
        setMessage(decision.message)
        setBusy(false)
        return
      }
      oauthLogin("google")
    } catch {
      setMessage(GOOGLE_SIGN_IN_UNAVAILABLE)
      setBusy(false)
    }
  }

  return (
    <div className="signin-google">
      <button className={buttonClass} type="button" onClick={() => void onClick()} disabled={busy}>
        {busy ? "Checking Google…" : GOOGLE_SIGN_IN_LABEL}
      </button>
      {message ? (
        <p className={alertClass} role="status">
          {message}
        </p>
      ) : null}
      <p className={helpClass}>{GOOGLE_SIGN_IN_HELP}</p>
    </div>
  )
}
