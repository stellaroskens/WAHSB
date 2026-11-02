import { Link } from "react-router-dom"
import { PageMeta } from "../../components/PageMeta"
import { homeHeroBanner } from "../../content/media"
import { seasonRegistrationClosed } from "../../content/site"
import { useAuth } from "../../lib/auth/AuthProvider"
import { ADMIN_SECTIONS, adminSectionGroups } from "../../lib/auth/adminSections"
import { primaryStaffRole } from "../../lib/auth/roles"
import { rolesFromUser, usernameFromUser } from "../../lib/auth/session"
import { IconArrow, IconPeople, IconPin, IconShield, IconWhistle } from "../../components/staff/portalIcons"

const ROLE_TITLE = {
  super_admin: "Administrator",
  coach: "Coach",
  team_administrator: "Club Administrator",
} as const

const SEASON = seasonRegistrationClosed.heading.match(/\d{4}–\d{4}/)?.[0] ?? "Current"

export function AdminDashboard() {
  const { user } = useAuth()
  const role = primaryStaffRole(rolesFromUser(user))
  const name = usernameFromUser(user) || user?.email || "Signed-in staff"
  const groups = adminSectionGroups()

  return (
    <div className="admin-page portal-dashboard">
      <PageMeta title="Admin | Albany High School Bowling" description="Super administrator control center for Albany High School Bowling." />
      <section className="portal-hero" aria-label="Bowl-A-Thon">
        <img
          src={homeHeroBanner.src}
          srcSet={homeHeroBanner.srcSet}
          alt="Bowl-A-Thon. Strike up support for our bowlers."
          width={homeHeroBanner.width}
          height={homeHeroBanner.height}
        />
      </section>
      <section className="portal-welcome">
        <div>
          <p>Welcome back,</p>
          <h2>{role ? ROLE_TITLE[role] : "Staff"}</h2>
          <span>{name}. This login keeps Super Administrator access.</span>
        </div>
        <p>Manage the bowling club website, team information, events, and member access from the existing tools.</p>
        <div className="portal-season">
          <IconPin />
          <strong>{SEASON} season</strong>
          <span>Club portal</span>
        </div>
      </section>
      <section className="portal-workflows" aria-label="Workflows">
        <Link className="portal-workflow portal-workflow--admin" to="/admin/settings">
          <IconShield />
          <h3>Admin workflow</h3>
          <p>Site content, staff permissions, and club settings for this Super Administrator login.</p>
          <span className="portal-workflow__go"><IconArrow /></span>
        </Link>
        <Link className="portal-workflow portal-workflow--coach" to="/coach">
          <IconWhistle />
          <h3>Coach workflow</h3>
          <p>Open the coach dashboard with this login. A second coach account is not required.</p>
          <span className="portal-workflow__go"><IconArrow /></span>
        </Link>
        <Link className="portal-workflow portal-workflow--team" to="/team-administrator">
          <IconPeople />
          <h3>Team admin workflow</h3>
          <p>Open the Club Administrator dashboard without signing in as another person.</p>
          <span className="portal-workflow__go"><IconArrow /></span>
        </Link>
        <Link className="portal-workflow portal-workflow--family" to="/admin/family">
          <IconPeople />
          <h3>Parent / guest workflow</h3>
          <p>Family access is closed. This screen does not open student or household records.</p>
          <span className="portal-workflow__go"><IconArrow /></span>
        </Link>
      </section>
      <section className="portal-actions" aria-label="Quick actions">
        <h2>Quick actions</h2>
        <div>
          <Link to="/admin/content">Edit website pages</Link>
          <Link to="/admin/tournaments">Update schedule</Link>
          <Link to="/admin/bowlers">Manage roster</Link>
          <Link to="/admin/announcements">Post announcement</Link>
          <Link to="/admin/media">Upload media</Link>
          <Link to="/admin/history">View reports</Link>
        </div>
      </section>
      <div className="portal-board">
        <section>
          <header className="portal-section-head">
            <h2>Management panels</h2>
            <p>Open any existing management screen. Counts are not shown because a private roster is not connected.</p>
          </header>
          {groups.map((group) => (
            <div key={group} className="portal-panels">
              <h3 className="visually-hidden">{group}</h3>
              {ADMIN_SECTIONS.filter((section) => section.group === group && section.id !== "overview").map((section) => (
                <Link key={section.id} className="portal-panel" to={section.href}>
                  <strong>{section.title}</strong>
                  <span>{section.description}</span>
                  <em>Open {section.title}</em>
                </Link>
              ))}
            </div>
          ))}
          <p className="portal-note">
            <Link to="/coach">View Coach Dashboard</Link>
            {" · "}
            <Link to="/admin/coaches">Manage Coach Settings</Link>
            {" · "}
            <Link to="/team-administrator">View Club Administrator Dashboard</Link>
            {" · "}
            <Link to="/admin/club">Manage Club Administrator Settings</Link>
          </p>
        </section>
        <aside>
          <section className="portal-sidepanel">
            <header>
              <h2>Club announcements</h2>
              <Link to="/admin/announcements">View all</Link>
            </header>
            <p>No published announcement list is stored for this panel. Email sending stays off until it is verified.</p>
          </section>
          <section className="portal-sidepanel">
            <header>
              <h2>Season status</h2>
              <span>Closed</span>
            </header>
            <p>{seasonRegistrationClosed.heading}</p>
            <p>{seasonRegistrationClosed.description}</p>
            <p>Start and end dates are not stored, so a progress bar is not shown.</p>
          </section>
        </aside>
      </div>
    </div>
  )
}
