import { NavLink } from "react-router-dom"
import { PageMeta } from "../../components/PageMeta"
import { useAuth } from "../../lib/auth/AuthProvider"
import { hasPermission } from "../../lib/auth/permissions"
import { rolesFromUser } from "../../lib/auth/session"

export function CoachDashboard() {
  const { user, username, logout } = useAuth()
  const roles = rolesFromUser(user)

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar__brand">
          <p className="admin-topbar__eyebrow">WAHSB</p>
          <strong>Coach</strong>
        </div>
        <nav className="admin-topbar__nav" aria-label="Coach">
          <NavLink to="/coach" end>
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
        <PageMeta title="Coach Dashboard | Albany High School Bowling" description="Coach tools for Albany High School Bowling." />
        <div className="admin-page__intro">
          <h2>Coach dashboard</h2>
          <p>Permitted coaching actions only. Payment management and staff role management are not available here.</p>
        </div>
        <ul className="admin-section-list">
          <li className="admin-section-list__item">
            <div>
              <h3>Edit designated coaching info</h3>
              <p>{hasPermission(roles, "edit_coaching_info") ? "Permitted — editor arrives with content tools." : "Not permitted."}</p>
            </div>
            <span className="admin-badge">{hasPermission(roles, "edit_coaching_info") ? "Allowed" : "Blocked"}</span>
          </li>
          <li className="admin-section-list__item">
            <div>
              <h3>Propose tournament / practice updates</h3>
              <p>{hasPermission(roles, "propose_tournament_updates") ? "Permitted — submit for admin review (Phase 3 publishing)." : "Not permitted."}</p>
            </div>
            <span className="admin-badge">{hasPermission(roles, "propose_tournament_updates") ? "Allowed" : "Blocked"}</span>
          </li>
          <li className="admin-section-list__item">
            <div>
              <h3>Payment management</h3>
              <p>Coaches cannot manage payments.</p>
            </div>
            <span className="admin-badge">Blocked</span>
          </li>
          <li className="admin-section-list__item">
            <div>
              <h3>Staff role management</h3>
              <p>Coaches cannot invite staff or change roles.</p>
            </div>
            <span className="admin-badge">Blocked</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
