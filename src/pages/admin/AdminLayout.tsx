import { NavLink, Outlet } from "react-router-dom"
import { useAuth } from "../../lib/auth/AuthProvider"

export function AdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar__brand">
          <p className="admin-topbar__eyebrow">WAHSB</p>
          <strong>Admin</strong>
        </div>
        <nav className="admin-topbar__nav" aria-label="Admin">
          <NavLink to="/admin" end>
            Dashboard
          </NavLink>
          <NavLink to="/admin/content">Pages</NavLink>
          <NavLink to="/admin/connections">Connections</NavLink>
          <NavLink to="/admin/announcements">Announcements</NavLink>
          <NavLink to="/admin/tournaments">Tournaments</NavLink>
          <NavLink to="/admin/staff">Staff</NavLink>
          <NavLink to="/admin/media">Media</NavLink>
          <NavLink to="/admin/history">History</NavLink>
          <NavLink to="/admin/settings">Settings</NavLink>
        </nav>
        <div className="admin-topbar__account">
          <span className="admin-topbar__email">{user?.email}</span>
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            onClick={async () => {
              await logout()
              window.location.assign("/staff/login")
            }}
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
