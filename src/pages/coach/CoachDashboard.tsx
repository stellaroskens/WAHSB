import { Link } from "react-router-dom"
import { PageMeta } from "../../components/PageMeta"
import { StaffHelp } from "../../components/staff/StaffHelp"
import { useAuth } from "../../lib/auth/AuthProvider"
import { hasPermission } from "../../lib/auth/permissions"
import { isSuperAdmin } from "../../lib/auth/roles"
import { rolesFromUser } from "../../lib/auth/session"

export function CoachDashboard() {
  const { user } = useAuth()
  const roles = rolesFromUser(user)

  return (
      <div className="admin-page">
        <PageMeta title="Coach Dashboard | Albany High School Bowling" description="Coach tools for Albany High School Bowling." />
        <div className="admin-page__intro">
          <h2>
            Coach dashboard
            <StaffHelp label="Coach dashboard" text="Shows coaching tools for this login. Payment settings and staff roles are not available here. Edits to bowler information stay drafts until a super administrator publishes them." />
          </h2>
          <p>Permitted coaching actions only. Payment management and staff role management are not available here.</p>
          {isSuperAdmin(roles) ? (
            <p>
              <Link to="/admin/coaches">Manage Coach Settings</Link>
              {" · "}
              <Link to="/admin">Return to Main Admin Dashboard</Link>
            </p>
          ) : null}
          <p>
            <Link to="/coach/bowlers">Meet the Bowlers</Link>
          </p>
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
  )
}
