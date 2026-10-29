import { useState, type FormEvent } from "react"
import { PasswordRecoveryForm } from "../../components/auth/PasswordRecoveryForm"
import { useAuth } from "../../lib/auth/AuthProvider"
import { loginErrorMessage } from "../../lib/auth/postLogin"
import { useStaffAccessCheck } from "../../lib/auth/useStaffAccessCheck"

export function StaffSignInPanel() {
  const { user, loading, authUiEnabled, login, logout } = useAuth()
  const access = useStaffAccessCheck(authUiEnabled)
  const [mode, setMode] = useState<"login" | "recovery">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (loading || access.checking) {
    return <p className="signin-status" role="status">Checking your sign-in…</p>
  }

  if (!authUiEnabled) {
    return (
      <p className="signin-status" role="status">
        Staff sign-in is not open yet. Every public page still works without an account.
      </p>
    )
  }

  if (user && access.blockedMessage) {
    return (
      <div className="signin-status" role="alert">
        <p>{access.blockedMessage}</p>
        <button className="button button-primary" type="button" onClick={() => void access.check()}>
          Try again
        </button>
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
    access.reset()
    try {
      await login(email, password)
      setPassword("")
    } catch (err) {
      setError(loginErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      {access.blockedMessage ? (
        <p className="signin-alert signin-alert--error" role="alert">
          {access.blockedMessage}
        </p>
      ) : null}
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
