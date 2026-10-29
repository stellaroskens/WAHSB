import { useState, type FormEvent } from "react"
import type { User } from "@netlify/identity"
import { assignedUsername } from "../../lib/auth/activation"
import {
  STAFF_PASSWORD_HELP,
  STAFF_PASSWORD_MIN_LENGTH,
  validateStaffPasswordPair,
} from "../../lib/auth/passwordPolicy"

type Props = {
  mode: "password" | "profile"
  user: User | null
  busy: boolean
  onInvalidPassword: (message: string) => void
  onAcceptPassword: (password: string) => Promise<void>
  onSaveProfile: (fullName: string) => Promise<void>
  onContinue: () => void
}

export function StaffInviteSetup({
  mode,
  user,
  busy,
  onInvalidPassword,
  onAcceptPassword,
  onSaveProfile,
  onContinue,
}: Props) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [displayName, setDisplayName] = useState(user?.name ?? "")
  const username = assignedUsername(user)

  async function onPassword(event: FormEvent) {
    event.preventDefault()
    const passwordCheck = validateStaffPasswordPair(password, confirmPassword)
    if (!passwordCheck.ok) {
      onInvalidPassword(passwordCheck.error)
      return
    }
    await onAcceptPassword(password)
    setPassword("")
    setConfirmPassword("")
  }

  async function onProfile(event: FormEvent) {
    event.preventDefault()
    await onSaveProfile(displayName)
  }

  if (mode === "profile") {
    return (
      <form className="admin-form" onSubmit={onProfile}>
        <h2>Complete your profile</h2>
        <p>
          Your password is saved with the sign-in provider. Your role was assigned by an administrator and cannot be
          chosen or changed here.
        </p>
        <label>
          Approved email address
          <input type="email" value={user?.email ?? ""} readOnly autoComplete="email" />
        </label>
        <label>
          Assigned username
          <input
            type="text"
            value={username || "Assigned by an administrator"}
            readOnly
            aria-describedby="assigned-username-help"
          />
        </label>
        <p className="admin-help" id="assigned-username-help">
          Usernames are display names only. You cannot choose a username or a role on this page.
        </p>
        <label>
          Display name
          <input
            type="text"
            autoComplete="name"
            maxLength={80}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
        </label>
        <button className="admin-btn" type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save profile and continue"}
        </button>
        <button className="admin-btn admin-btn--ghost" type="button" disabled={busy} onClick={onContinue}>
          Continue without changing the name
        </button>
      </form>
    )
  }

  return (
    <form className="admin-form" onSubmit={onPassword}>
      <h2>Create your password</h2>
      <p>
        The invitation link is verified. The sign-in provider requires a password before the account can be activated.
        Your role stays the one an administrator assigned.
      </p>
      <p className="admin-help" id="staff-password-help">
        {STAFF_PASSWORD_HELP}
      </p>
      <label>
        Password
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
        {busy ? "Saving…" : "Save password"}
      </button>
    </form>
  )
}
