import { Link } from "react-router-dom"
import { PageMeta } from "../../components/PageMeta"
import { ADMIN_SECTIONS, adminSectionGroups } from "../../lib/auth/adminSections"

export function AdminDashboard() {
  const groups = adminSectionGroups()

  return (
    <div className="admin-page">
      <PageMeta
        title="Admin | Albany High School Bowling"
        description="Super administrator control center for Albany High School Bowling."
      />
      <div className="admin-page__intro">
        <h2>Dashboard Overview</h2>
        <p>
          Manage the public site, coach tools, and Club Administrator tools from this account. You do not need to sign
          in as a coach or the Club Administrator, and those people keep their own logins.
        </p>
        <p>
          <Link to="/coach">View Coach Dashboard</Link>
          {" · "}
          <Link to="/admin/coaches">Manage Coach Settings</Link>
          {" · "}
          <Link to="/team-administrator">View Club Administrator Dashboard</Link>
          {" · "}
          <Link to="/admin/club">Manage Club Administrator Settings</Link>
          {" · "}
          <Link to="/admin">Return to Main Admin Dashboard</Link>
        </p>
      </div>
      {groups.map((group) => (
        <section key={group} aria-labelledby={`admin-group-${group}`}>
          <h3 id={`admin-group-${group}`}>{group}</h3>
          <ul className="admin-section-list">
            {ADMIN_SECTIONS.filter((section) => section.group === group).map((section) => (
              <li key={section.id} className="admin-section-list__item">
                <div>
                  <h3>
                    <Link to={section.href}>{section.title}</Link>
                  </h3>
                  <p>{section.description}</p>
                </div>
                <span className="admin-badge">{section.statusLabel}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
