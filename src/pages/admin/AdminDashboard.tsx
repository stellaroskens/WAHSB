import { Link } from "react-router-dom"
import { PageMeta } from "../../components/PageMeta"
import { ADMIN_SECTIONS } from "../../lib/auth/adminSections"

export function AdminDashboard() {
  return (
    <div className="admin-page">
      <PageMeta
        title="Admin | Albany High School Bowling"
        description="Invitation-only administrator dashboard for Albany High School Bowling."
      />
      <div className="admin-page__intro">
        <h2>Dashboard</h2>
        <p>Open a section to edit the content that section can save. A super administrator does not need extra roles to view the coach or Club Administrator dashboards.</p>
        <p>
          <Link to="/admin/content">Website Page Editor</Link>
          {" · "}
          <Link to="/coach">Coach Dashboard</Link>
          {" · "}
          <Link to="/team-administrator">Club Administrator Dashboard</Link>
          {" · "}
          <Link to="/admin/connections">Financial Settings</Link>
          {" · "}
          <Link to="/admin/staff">Staff Management</Link>
        </p>
      </div>
      <ul className="admin-section-list">
        {ADMIN_SECTIONS.map((section) => (
          <li key={section.id} className="admin-section-list__item">
            <div>
              <h3>{section.title}</h3>
              <p>{section.description}</p>
              {section.href && section.status === "available" ? (
                <p>
                  <Link to={section.href}>Open {section.title}</Link>
                </p>
              ) : null}
            </div>
            <span className="admin-badge">{section.statusLabel}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
