import { useEffect, useState, type FormEvent } from "react"
import { PageMeta } from "../../components/PageMeta"
import { PLANNED_STAFF } from "../../lib/auth/staffRoster"

type StaffAccount = {
  id: string
  email: string | null
  username: string | null
  roles: string[]
  primaryRole: string | null
  invitedAt: string | null
  confirmedAt: string | null
  active: boolean
}

export function AdminStaff() {
  const [username, setUsername] = useState(PLANNED_STAFF[0]?.username ?? "")
  const [email, setEmail] = useState("")
  const [accounts, setAccounts] = useState<StaffAccount[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/staff", {
        credentials: "include",
        headers: { Accept: "application/json" },
      })
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error || "Unable to load staff accounts.")
      }
      const body = (await response.json()) as { accounts: StaffAccount[] }
      setAccounts(body.accounts ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load staff accounts.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const onInvite = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch("/api/admin/staff/invite", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username }),
      })
      const body = (await response.json()) as { error?: string; note?: string; ok?: boolean }
      if (!response.ok) throw new Error(body.error || "Invite failed.")
      setMessage(body.note || "Invitation sent. The account stays inactive until they accept.")
      setEmail("")
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invite failed.")
    } finally {
      setBusy(false)
    }
  }

  const selected = PLANNED_STAFF.find((member) => member.username === username)

  return (
    <div className="admin-page">
      <PageMeta
        title="Staff Accounts | Albany High School Bowling"
        description="Invite-only staff account management for Albany High School Bowling."
      />
      <div className="admin-page__intro">
        <h2>Staff Accounts</h2>
        <p>
          Invite approved staff by entering their real email and choosing a planned username/role. No public signup. No
          invented emails. Usernames display in the UI but are never proof of identity.
        </p>
      </div>

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

      <form className="admin-panel-form" onSubmit={onInvite}>
        <h3>Send invitation</h3>
        <label>
          Planned staff member
          <select value={username} onChange={(event) => setUsername(event.target.value)} required>
            {PLANNED_STAFF.map((member) => (
              <option key={member.username} value={member.username}>
                {member.displayName} ({member.username}) — {member.role}
              </option>
            ))}
          </select>
        </label>
        <p className="admin-help">
          Role to assign after acceptance: <code>{selected?.role}</code>. Access is inactive until they confirm email
          ownership and set a password (at least 5 characters; letters and numbers are enough — symbols optional).
        </p>
        <label>
          Staff email (required — enter the person’s real address)
          <input
            type="email"
            autoComplete="off"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="name@example.com"
          />
        </label>
        <button className="admin-btn" type="submit" disabled={busy}>
          {busy ? "Sending…" : "Send secure invitation"}
        </button>
      </form>

      <div className="admin-page__intro" style={{ marginTop: "2rem" }}>
        <h3>Planned roster</h3>
        <ul className="admin-section-list">
          {PLANNED_STAFF.map((member) => (
            <li key={member.username} className="admin-section-list__item">
              <div>
                <h3>
                  {member.displayName} <span className="admin-badge">@{member.username}</span>
                </h3>
                <p>
                  {member.title} · role <code>{member.role}</code> · email supplied only at invite time
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="admin-page__intro" style={{ marginTop: "2rem" }}>
        <h3>Identity accounts</h3>
        {loading ? (
          <p>Loading…</p>
        ) : accounts.length === 0 ? (
          <p>No Identity users loaded yet (Identity must be enabled on Netlify).</p>
        ) : (
          <ul className="admin-section-list">
            {accounts.map((account) => (
              <li key={account.id} className="admin-section-list__item">
                <div>
                  <h3>{account.email ?? "Unknown email"}</h3>
                  <p>
                    username {account.username ?? "(none)"} · roles{" "}
                    {account.roles.length ? account.roles.join(", ") : "none"} ·{" "}
                    {account.active ? "accepted" : "invitation pending / inactive"}
                  </p>
                </div>
                <span className="admin-badge">{account.active ? "Active" : "Inactive"}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
