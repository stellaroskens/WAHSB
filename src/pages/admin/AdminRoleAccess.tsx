import { Link } from "react-router-dom"
import { PageMeta } from "../../components/PageMeta"
import { PLANNED_STAFF } from "../../lib/auth/staffRoster"

type ManageLink = { href: string; label: string; detail: string }

export function AdminRoleAccess({
  title,
  description,
  viewHref,
  viewLabel,
  accounts,
  links,
}: {
  title: string
  description: string
  viewHref: string
  viewLabel: string
  accounts: string
  links: ManageLink[]
}) {
  const people = PLANNED_STAFF.filter((member) => accounts === member.role)

  return (
    <div className="admin-page">
      <PageMeta title={`${title} | Albany High School Bowling`} description={description} />
      <div className="admin-page__intro">
        <h2>{title}</h2>
        <p>{description}</p>
        <p>This login stays the super administrator. It does not sign in as another person, and it does not change that person's role.</p>
        <p>
          <Link to={viewHref}>{viewLabel}</Link>
          {" · "}
          <Link to="/admin">Return to Main Admin Dashboard</Link>
        </p>
      </div>
      <ul className="admin-section-list">
        {people.map((member) => (
          <li key={member.username} className="admin-section-list__item">
            <div>
              <h3>
                {member.displayName} · @{member.username}
              </h3>
              <p>{member.role === "coach" ? "Coach" : "Club Administrator"}. This is a separate account.</p>
            </div>
            <span className="admin-badge">Own login</span>
          </li>
        ))}
        {links.map((link) => (
          <li key={link.href} className="admin-section-list__item">
            <div>
              <h3>
                <Link to={link.href}>{link.label}</Link>
              </h3>
              <p>{link.detail}</p>
            </div>
            <span className="admin-badge">Open</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function AdminCoaches() {
  return (
    <AdminRoleAccess
      title="Coaches and Staff"
      description="Coach tools available to this super administrator account, plus staff invitations."
      viewHref="/coach"
      viewLabel="View Coach Dashboard"
      accounts="coach"
      links={[
        {
          href: "/admin/content?page=coaches",
          label: "Manage Coach Settings",
          detail: "Public names and biographies. This does not change who can sign in.",
        },
        {
          href: "/admin/bowlers",
          label: "Meet the Bowlers",
          detail: "The same bowler editor coaches use. Publishing stays with the super administrator.",
        },
        {
          href: "/admin/content?page=tournaments",
          label: "Tournament and practice proposals",
          detail: "Coaches can propose these updates. This account can edit them and publish.",
        },
        {
          href: "/admin/staff",
          label: "Staff invitations",
          detail: "Invite approved staff. Roles are assigned by the server, not by the invitation form.",
        },
      ]}
    />
  )
}

export function AdminClub() {
  return (
    <AdminRoleAccess
      title="Club Administrator Management"
      description="Club Administrator tools available to this super administrator account."
      viewHref="/team-administrator"
      viewLabel="View Club Administrator Dashboard"
      accounts="team_administrator"
      links={[
        {
          href: "/admin/content?page=practices",
          label: "Manage Club Administrator Settings",
          detail: "Practice location and scheduling copy the Club Administrator is permitted to prepare.",
        },
        {
          href: "/admin/bowlers",
          label: "Meet the Bowlers",
          detail: "The same bowler editor the Club Administrator uses. Publishing stays with the super administrator.",
        },
        {
          href: "/admin/content?page=volunteer",
          label: "Volunteers",
          detail: "Public volunteer copy. Screening records are not stored.",
        },
        {
          href: "/admin/announcements",
          label: "Announcements",
          detail: "Prepare an announcement. This page does not send email.",
        },
        {
          href: "/admin/connections",
          label: "Payment connections",
          detail: "The Club Administrator may prepare destinations. Only a super administrator can verify or enable a live payment.",
        },
      ]}
    />
  )
}
