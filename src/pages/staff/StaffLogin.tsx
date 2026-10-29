import { useState, type FormEvent } from "react"
import type { User } from "@netlify/identity"
import { Link, useLocation } from "react-router-dom"
import { PasswordRecoveryForm } from "../../components/auth/PasswordRecoveryForm"
import { PageMeta } from "../../components/PageMeta"
import { PROFILE_SAVE_FAILED, passwordSetupProblem } from "../../lib/auth/activation"
import { useAuth } from "../../lib/auth/AuthProvider"
import {
  STAFF_PASSWORD_HELP,
  STAFF_PASSWORD_MIN_LENGTH,
  validateStaffPasswordPair,
} from "../../lib/auth/passwordPolicy"
import { guardReasonMessage, loginErrorMessage } from "../../lib/auth/postLogin"
import { useStaffAccessCheck } from "../../lib/auth/useStaffAccessCheck"
import { StaffInviteSetup } from "./StaffInviteSetup"

export function StaffLogin() {
  const {
    loading,
    authUiEnabled,
    user,
    callbackKind,
    callbackProblem,
    inviteToken,
    login,
    logout,
    acceptStaffInvite,
    saveDisplayName,
    completeInviteSetup,
    setNewPassword,
  } = useAuth()
  const location = useLocation()
  const [guardMessage, setGuardMessage] = useState(() =>
    guardReasonMessage((location.state as { reason?: unknown } | null)?.reason),
  )
  const inCallback = callbackKind === "invite" || callbackKind === "recovery"
  const access = useStaffAccessCheck(authUiEnabled && !inCallback && !guardMessage)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [profileUser, setProfileUser] = useState<User | null>(null)
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

  if (access.checking) {
    return (
      <div className="admin-shell admin-shell--login">
        <PageMeta title="Staff Login | Albany High School Bowling" description="Staff sign-in for Albany High School Bowling." />
        <p role="status">Checking staff access…</p>
      </div>
    )
  }

  const blockedMessage = access.blockedMessage ?? guardMessage

  const onLogin = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)
    setGuardMessage(null)
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

  const onAcceptInvite = async (nextPassword: string) => {
    if (!inviteToken) return
    setBusy(true)
    setError(null)
    try {
      const next = await acceptStaffInvite(nextPassword)
      setProfileUser(next)
      setMessage("Password saved. Confirm your display name, then continue to the dashboard for your approved role.")
    } catch (err) {
      setError(passwordSetupProblem(err))
    } finally {
      setBusy(false)
    }
  }

  const onSaveProfile = async (fullName: string) => {
    if (!profileUser) return
    setBusy(true)
    setError(null)
    try {
      await saveDisplayName(profileUser, fullName)
      setProfileUser(null)
      completeInviteSetup()
    } catch {
      setError(PROFILE_SAVE_FAILED)
    } finally {
      setBusy(false)
    }
  }

  const onContinueProfile = () => {
    setProfileUser(null)
    completeInviteSetup()
  }

  const onCompleteRecovery = async (event: FormEvent) => {
    event.preventDefault()
    const passwordCheck = validateStaffPasswordPair(password, confirmPassword)
    if (!passwordCheck.ok) {
      setError(passwordCheck.error)
      return
    }
    setBusy(true)
    setError(null)
    try {
      await setNewPassword(password)
      setMessage("Password saved with Netlify Identity. Sign in with your new password.")
    } catch (err) {
      setError(passwordSetupProblem(err))
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

        {blockedMessage && (
          <div className="admin-alert admin-alert--error" role="alert">
            <p>{blockedMessage}</p>
            {user ? (
              <div className="admin-form__actions">
                <button className="admin-btn" type="button" onClick={() => void access.check()}>
                  Try again
                </button>
                <button
                  className="admin-btn admin-btn--ghost"
                  type="button"
                  onClick={() => {
                    void logout().finally(() => setGuardMessage(null))
                  }}
                >
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        )}
        {callbackProblem && !error ? (
          <p className="admin-alert admin-alert--error" role="alert">
            {callbackProblem}
          </p>
        ) : null}
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

        {callbackKind === "invite" && (inviteToken || profileUser) ? (
          <StaffInviteSetup
            key={profileUser ? "profile" : "password"}
            mode={profileUser ? "profile" : "password"}
            user={profileUser}
            busy={busy}
            onInvalidPassword={setError}
            onAcceptPassword={onAcceptInvite}
            onSaveProfile={onSaveProfile}
            onContinue={onContinueProfile}
          />
        ) : callbackKind === "recovery" ? (
          <form className="admin-form" onSubmit={onCompleteRecovery}>
            <h2>Choose a new password</h2>
            <p className="admin-help" id="staff-password-help">
              {STAFF_PASSWORD_HELP}
            </p>
            <label>
              New password
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={STAFF_PASSWORD_MIN_LENGTH}
                aria-describedby="staff-password-help"
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
                minLength={STAFF_PASSWORD_MIN_LENGTH}
                aria-describedby="staff-password-help"
              />
            </label>
            <button className="admin-btn" type="submit" disabled={busy}>
              {busy ? "Saving…" : "Update password"}
            </button>
          </form>
        ) : mode === "recovery" ? (
          <>
            <h2>Password recovery</h2>
            <PasswordRecoveryForm variant="admin" initialEmail={email} onBack={() => setMode("login")} />
          </>
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
            <button
              className="admin-btn admin-btn--ghost"
              type="button"
              onClick={() => {
                setMode("recovery")
                setError(null)
                setMessage(null)
              }}
            >
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
