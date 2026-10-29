import { AuthError } from "@netlify/identity"
import { useState, type FormEvent } from "react"
import { Link, Navigate } from "react-router-dom"
import { PageMeta } from "../../components/PageMeta"
import { useAuth } from "../../lib/auth/AuthProvider"
import { dashboardPathForRole, primaryStaffRole } from "../../lib/auth/roles"
import { rolesFromUser } from "../../lib/auth/session"

export function StaffLogin() {
  const {
    loading,
    authUiEnabled,
    user,
    callbackKind,
    inviteToken,
    login,
    acceptStaffInvite,
    requestRecovery,
    setNewPassword,
  } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [mode, setMode] = useState<"login" | "recovery">("login")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (loading) {
    return (
      <div className="admin-shell admin-shell--login">
        <PageMeta title="Staff Login | Albany High School Bowling" description="Staff sign-in for Albany High School Bowling." />
        <p role="status">Loading…</p>
      </div>
    )
  }

  if (!authUiEnabled) {
    return (
      <div className="admin-shell admin-shell--login">
        <PageMeta
          title="Staff Login | Albany High School Bowling"
          description="Staff access is not open on the public site yet."
        />
        <div className="admin-card admin-card--narrow">
          <p className="admin-topbar__eyebrow">WAHSB</p>
          <h1>Staff access is not open yet</h1>
          <p>
            Invitation-only staff authentication is in the codebase but intentionally disabled until Netlify Identity is
            invite-only and the first super admin is provisioned. There is no public password, temporary passcode, or
            self-serve registration.
          </p>
          <Link className="admin-btn" to="/">
            Back to the public site
          </Link>
        </div>
      </div>
    )
  }

  const role = primaryStaffRole(rolesFromUser(user))
  if (user && role && callbackKind !== "invite" && callbackKind !== "recovery") {
    return <Navigate to={dashboardPathForRole(role)} replace />
  }

  const fail = (err: unknown) => {
    if (err instanceof AuthError) setError(err.message)
    else if (err instanceof Error) setError(err.message)
    else setError("Something went wrong.")
  }

  const onLogin = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      await login(email, password)
      // Hard navigation so nf_jwt is present for CDN role checks and Functions.
      window.location.assign("/staff/login")
    } catch (err) {
      fail(err)
      setBusy(false)
    }
  }

  const onAcceptInvite = async (event: FormEvent) => {
    event.preventDefault()
    if (!inviteToken) return
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (password.length < 12) {
      setError("Use a password with at least 12 characters.")
      return
    }
    setBusy(true)
    setError(null)
    try {
      await acceptStaffInvite(password)
      setMessage(
        "Invitation accepted. Your username and role are assigned by an administrator after email verification — usernames alone are never proof of access.",
      )
      setPassword("")
      setConfirmPassword("")
    } catch (err) {
      fail(err)
    } finally {
      setBusy(false)
    }
  }

  const onRequestRecovery = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      await requestRecovery(email)
      setMessage("If that account exists, a recovery email was sent.")
      setMode("login")
    } catch (err) {
      fail(err)
    } finally {
      setBusy(false)
    }
  }

  const onCompleteRecovery = async (event: FormEvent) => {
    event.preventDefault()
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (password.length < 12) {
      setError("Use a password with at least 12 characters.")
      return
    }
    setBusy(true)
    setError(null)
    try {
      await setNewPassword(password)
      setMessage("Password updated. Sign in with your new password.")
    } catch (err) {
      fail(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-shell admin-shell--login">
      <PageMeta title="Staff Login | Albany High School Bowling" description="Staff sign-in for Albany High School Bowling." />
      <div className="admin-card admin-card--narrow">
        <p className="admin-topbar__eyebrow">WAHSB</p>
        <h1>Staff login</h1>
        <p>Invitation-only. Accounts are not created by typing an email here.</p>

        {error && (
          <p className="admin-alert admin-alert--error" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="admin-alert" role="status">
            {message}
          </p>
        )}

        {callbackKind === "invite" && inviteToken ? (
          <form className="admin-form" onSubmit={onAcceptInvite}>
            <h2>Accept invitation</h2>
            <p>Confirm email ownership by setting a secure password from your invite link.</p>
            <label>
              New password
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={12}
              />
            </label>
            <label>
              Confirm password
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={12}
              />
            </label>
            <button className="admin-btn" type="submit" disabled={busy}>
              {busy ? "Saving…" : "Set password"}
            </button>
          </form>
        ) : callbackKind === "recovery" ? (
          <form className="admin-form" onSubmit={onCompleteRecovery}>
            <h2>Choose a new password</h2>
            <label>
              New password
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={12}
              />
            </label>
            <label>
              Confirm password
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={12}
              />
            </label>
            <button className="admin-btn" type="submit" disabled={busy}>
              {busy ? "Saving…" : "Update password"}
            </button>
          </form>
        ) : mode === "recovery" ? (
          <form className="admin-form" onSubmit={onRequestRecovery}>
            <h2>Password recovery</h2>
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
            <button className="admin-btn" type="submit" disabled={busy}>
              {busy ? "Sending…" : "Send recovery link"}
            </button>
            <button className="admin-btn admin-btn--ghost" type="button" onClick={() => setMode("login")}>
              Back to sign in
            </button>
          </form>
        ) : (
          <form className="admin-form" onSubmit={onLogin}>
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
            <button className="admin-btn" type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
            <button className="admin-btn admin-btn--ghost" type="button" onClick={() => setMode("recovery")}>
              Forgot password
            </button>
          </form>
        )}

        <p className="admin-footnote">No public staff signup. Usernames display in the UI but are never proof of identity.</p>
        <Link to="/">Public site</Link>
      </div>
    </div>
  )
}
