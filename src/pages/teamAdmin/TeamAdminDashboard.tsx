import { NavLink } from "react-router-dom"
import { PageMeta } from "../../components/PageMeta"
import { useAuth } from "../../lib/auth/AuthProvider"
import { hasPermission } from "../../lib/auth/permissions"
import { rolesFromUser } from "../../lib/auth/session"

export function TeamAdminDashboard() {
  const { user, username, logout } = useAuth()
  const roles = rolesFromUser(user)

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar__brand">
          <p className="admin-topbar__eyebrow">WAHSB</p>
          <strong>Team Admin</strong>
        </div>
        <nav className="admin-topbar__nav" aria-label="Team administrator">
          <NavLink to="/team-administrator" end>
            Dashboard
          </NavLink>
        </nav>
        <div className="admin-topbar__account">
          <span className="admin-topbar__email">
            {username ? `@${username}` : user?.email} (display only)
          </span>
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
      <div className="admin-page">
        <PageMeta
          title="Team Administrator | Albany High School Bowling"
          description="Team administrator tools for Albany High School Bowling."
        />
        <div className="admin-page__intro">
          <h2>Team administrator dashboard</h2>
          <p>
            Scheduling, announcements, and volunteer coordination support. Super-admin account management and financial
            payouts are blocked by default.
          </p>
        </div>
        <ul className="admin-section-list">
          <li className="admin-section-list__item">
            <div>
              <h3>Scheduling / ops content</h3>
              <p>{hasPermission(roles, "edit_scheduling_ops") ? "Permitted — editor arrives with content tools." : "Not permitted."}</p>
            </div>
            <span className="admin-badge">{hasPermission(roles, "edit_scheduling_ops") ? "Allowed" : "Blocked"}</span>
          </li>
          <li className="admin-section-list__item">
            <div>
              <h3>Propose team announcements</h3>
              <p>{hasPermission(roles, "propose_announcements") ? "Permitted — submit for approval." : "Not permitted."}</p>
            </div>
            <span className="admin-badge">{hasPermission(roles, "propose_announcements") ? "Allowed" : "Blocked"}</span>
          </li>
          <li className="admin-section-list__item">
            <div>
              <h3>Volunteer coordination support</h3>
              <p>{hasPermission(roles, "volunteer_coordination") ? "Permitted." : "Not permitted."}</p>
            </div>
            <span className="admin-badge">{hasPermission(roles, "volunteer_coordination") ? "Allowed" : "Blocked"}</span>
          </li>
          <li className="admin-section-list__item">
            <div>
              <h3>Super-admin account management</h3>
              <p>Team administrators cannot manage super_admin accounts.</p>
            </div>
            <span className="admin-badge">Blocked</span>
          </li>
          <li className="admin-section-list__item">
            <div>
              <h3>Financial payout management</h3>
              <p>Blocked by default for this role.</p>
            </div>
            <span className="admin-badge">Blocked</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
