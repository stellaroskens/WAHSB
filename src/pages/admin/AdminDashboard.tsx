import { Link } from "react-router-dom"
import { PageMeta } from "../../components/PageMeta"
import { ManagementCard } from "../../components/staff/ManagementCard"
import { useAuth } from "../../lib/auth/AuthProvider"
import { ADMIN_SECTIONS, adminSectionGroups } from "../../lib/auth/adminSections"
import { primaryStaffRole } from "../../lib/auth/roles"
import { rolesFromUser, usernameFromUser } from "../../lib/auth/session"
import { seasonRegistrationClosed } from "../../content/site"

const ROLE_LABEL = {
  super_admin: "Super Administrator",
  coach: "Coach",
  team_administrator: "Club Administrator",
} as const

export function AdminDashboard() {
  const { user } = useAuth()
  const role = primaryStaffRole(rolesFromUser(user))
  const name = usernameFromUser(user) || user?.email || "Signed-in staff"
  const season = seasonRegistrationClosed.heading.match(/\d{4}–\d{4}/)?.[0] ?? "Current season"
  const groups = adminSectionGroups()

  return (
    <div className="admin-page">
      <PageMeta
        title="Admin | Albany High School Bowling"
        description="Super administrator control center for Albany High School Bowling."
      />
      <header className="dash-welcome">
        <p className="dash-welcome__kicker">{season}</p>
        <h2>Dashboard Overview</h2>
        <p>
          {name}
          {role ? ` · ${ROLE_LABEL[role]}` : ""}. Manage the public site, coach tools, and Club Administrator tools from
          this account. You do not need to sign in as a coach or the Club Administrator.
        </p>
        <p>
          Counts for bowlers, teams, and coaches are not shown here. A private roster database is not connected, so this
          page does not invent those numbers.
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
      </header>
      {groups.map((group) => (
        <section key={group} aria-labelledby={`admin-group-${group}`}>
          <h3 id={`admin-group-${group}`}>{group}</h3>
          <div className="dash-grid">
            {ADMIN_SECTIONS.filter((section) => section.group === group && section.id !== "overview").map((section) => (
              <ManagementCard
                key={section.id}
                href={section.href}
                title={section.title}
                description={section.description}
                status={section.statusLabel}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
