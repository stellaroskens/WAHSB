import { useState, type FormEvent } from "react"
import { Navigate } from "react-router-dom"
import { PasswordRecoveryForm } from "../../components/auth/PasswordRecoveryForm"
import { useAuth } from "../../lib/auth/AuthProvider"
import { isRateLimitError } from "../../lib/auth/recovery"
import { staffHomePath } from "../../lib/auth/roles"
import { rolesFromUser } from "../../lib/auth/session"

// Identity distinguishes unknown emails from wrong passwords in some responses; never echo that back.
const LOGIN_FAILED =
  "That email and password did not work. Check both, or use Forgot Password. Accounts are invitation-only."
const TOO_MANY_ATTEMPTS = "Too many attempts. Please wait a few minutes before trying again."

export function StaffSignInPanel() {
  const { user, loading, authUiEnabled, login, logout } = useAuth()
  const [mode, setMode] = useState<"login" | "recovery">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (loading) {
    return <p className="signin-status" role="status">Checking your sign-in…</p>
  }

  if (!authUiEnabled) {
    return (
      <p className="signin-status" role="status">
        Staff sign-in is not open yet. Every public page still works without an account.
      </p>
    )
  }

  if (user) {
    const home = staffHomePath(rolesFromUser(user))
    if (home) return <Navigate to={home} replace />
    return (
      <div className="signin-status" role="status">
        <p>You are signed in, but this account does not have team access yet. Ask the coaches if you think this is a mistake.</p>
        <button className="button button-secondary" type="button" onClick={() => void logout()}>
          Sign out
        </button>
      </div>
    )
  }

  async function onLogin(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await login(email, password)
      setPassword("")
      // Full load so the Identity cookie reaches the CDN role checks on /admin, /coach, and /team-administrator.
      window.location.assign("/sign-in")
    } catch (err) {
      setError(isRateLimitError(err) ? TOO_MANY_ATTEMPTS : LOGIN_FAILED)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      {error ? (
        <p className="signin-alert signin-alert--error" role="alert">
          {error}
        </p>
      ) : null}

      {mode === "login" ? (
        <form className="signin-form" onSubmit={onLogin}>
          <label>
            Email
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button className="button button-primary signin-submit" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign In"}
          </button>
          <button
            className="signin-link"
            type="button"
            onClick={() => {
              setMode("recovery")
              setError(null)
            }}
          >
            Forgot Password?
          </button>
        </form>
      ) : (
        <PasswordRecoveryForm
          variant="public"
          initialEmail={email}
          onBack={() => {
            setMode("login")
            setError(null)
          }}
        />
      )}

      <p className="signin-help">
        Staff accounts are invitation-only. There is no public sign-up. Your access level comes from your invitation, not
        from anything you choose here.
      </p>
    </div>
  )
}
