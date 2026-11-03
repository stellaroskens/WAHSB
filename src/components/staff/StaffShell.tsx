import { useEffect, useState } from "react"
import { Link, NavLink, Outlet, useLocation } from "react-router-dom"
import { websiteLogo } from "../../content/media"
import { useAuth } from "../../lib/auth/AuthProvider"
import { isSuperAdmin, primaryStaffRole } from "../../lib/auth/roles"
import { rolesFromUser, usernameFromUser } from "../../lib/auth/session"
import { IconBell, IconCalendar, IconGear, IconHome, IconPages, IconPeople } from "./portalIcons"

function sectionIsCurrent(href: string, pathname: string, search: string, hash: string): boolean {
  const [path, query] = href.split("#")[0].split("?")
  const hrefHash = href.includes("#") ? `#${href.split("#")[1]}` : ""
  if (path !== pathname) return false
  if (query) return search === `?${query}`
  if (hrefHash) return hash === hrefHash
  if (path === "/admin" || path === "/coach" || path === "/team-administrator") return pathname === path
  return search === "" && hash === ""
}

type NavItem = { href: string; title: string; group: string }

const ADMIN_GROUPS: NavItem[] = [
  { group: "Overview", href: "/admin", title: "Dashboard" },
  { group: "Overview", href: "/admin/announcements", title: "Announcements" },
  { group: "Overview", href: "/admin/history", title: "History and reports" },
  { group: "Team", href: "/admin/coaches", title: "Coaches" },
  { group: "Team", href: "/admin/bowlers", title: "Team roster" },
  { group: "Team", href: "/admin/content?page=practices", title: "Practices" },
  { group: "Team", href: "/admin/tournaments", title: "Tournaments" },
  { group: "Website", href: "/admin/content", title: "Website pages" },
  { group: "Website", href: "/admin/media", title: "Media gallery" },
  { group: "Website", href: "/admin/content?page=resources", title: "Resources and forms" },
  { group: "Website", href: "/admin/links", title: "Website links" },
  { group: "Settings", href: "/admin/club", title: "Club settings" },
  { group: "Settings", href: "/admin/staff", title: "Staff and permissions" },
  { group: "Settings", href: "/admin/donations", title: "Financial settings" },
  { group: "Settings", href: "/admin/family", title: "Family access" },
  { group: "Settings", href: "/admin/consent", title: "Guardian consent" },
  { group: "Settings", href: "/admin/settings", title: "Site settings" },
  { group: "Settings", href: "/admin/status", title: "System settings" },
]

const PORTAL_LABEL = {
  admin: "Admin Portal",
  coach: "Coach Portal",
  club: "Club Portal",
} as const

const ROLE_LABEL = {
  super_admin: "Super Administrator",
  coach: "Coach",
  team_administrator: "Club Administrator",
} as const

export function StaffShell({ area }: { area: "admin" | "coach" | "club" }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [expanded, setExpanded] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const roles = rolesFromUser(user)
  const role = primaryStaffRole(roles)
  const account = user?.email || usernameFromUser(user) || "Signed-in staff"
  const home = area === "coach" ? "/coach" : area === "club" ? "/team-administrator" : "/admin"
  const coachLinks: NavItem[] = [
    { group: "Overview", href: "/coach", title: "Dashboard" },
    { group: "Team", href: "/coach/bowlers", title: "Bowlers" },
  ]
  const clubLinks: NavItem[] = [
    { group: "Overview", href: "/team-administrator", title: "Dashboard" },
    { group: "Team", href: "/team-administrator/bowlers", title: "Bowlers" },
  ]
  const links = area === "admin" ? ADMIN_GROUPS : area === "coach" ? coachLinks : clubLinks
  const groups = [...new Set(links.map((item) => item.group))]
  const rail = [
    { href: home, title: "Dashboard", icon: <IconHome /> },
    { href: area === "admin" ? "/admin/bowlers" : area === "coach" ? "/coach/bowlers" : "/team-administrator/bowlers", title: "Roster", icon: <IconPeople /> },
    { href: area === "admin" ? "/admin/tournaments" : home, title: "Schedule", icon: <IconCalendar /> },
    { href: area === "admin" ? "/admin/content" : home, title: "Pages", icon: <IconPages /> },
    { href: area === "admin" ? "/admin/settings" : home, title: "Settings", icon: <IconGear /> },
  ].filter((item, index, all) => all.findIndex((candidate) => candidate.href === item.href) === index)

  useEffect(() => {
    if (!mobileOpen) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [mobileOpen])

  const signOut = async () => {
    await logout()
    window.location.assign("/staff/login")
  }

  return (
    <div className={`admin-shell portal${expanded ? " is-expanded" : " is-collapsed"}${mobileOpen ? " is-drawer-open" : ""}`}>
      {mobileOpen ? (
        <button type="button" className="portal-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
      ) : null}
      <div className="portal-nav">
        <nav className="portal-rail" aria-label="Portal shortcuts">
          <button
            type="button"
            className="portal-rail__toggle"
            aria-expanded={expanded}
            aria-controls="staff-navigation"
            title={expanded ? "Collapse menu" : "Expand menu"}
            onClick={() => setExpanded((current) => !current)}
          >
            <span aria-hidden="true">{expanded ? "«" : "»"}</span>
            <span className="visually-hidden">{expanded ? "Collapse menu" : "Expand menu"}</span>
          </button>
          {rail.map((item) => (
            <NavLink key={item.href} to={item.href} title={item.title} aria-label={item.title} end={item.href === home} onClick={() => setMobileOpen(false)}>
              {item.icon}
            </NavLink>
          ))}
        </nav>
        <div className="portal-side" id="staff-navigation">
          <Link className="portal-logo" to={home} onClick={() => setMobileOpen(false)}>
            <img src={websiteLogo.src} width={240} height={135} alt="Albany High School Bowling" />
          </Link>
          <nav aria-label="Staff">
            {groups.map((group) => (
              <section key={group}>
                <h2>{group}</h2>
                {links
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      end={item.href === "/admin" || item.href === "/coach" || item.href === "/team-administrator"}
                      onClick={() => setMobileOpen(false)}
                      className={() => (sectionIsCurrent(item.href, location.pathname, location.search, location.hash) ? "active" : "")}
                    >
                      {item.title}
                    </NavLink>
                  ))}
              </section>
            ))}
            {area !== "admin" && isSuperAdmin(roles) ? (
              <section>
                <h2>Admin</h2>
                <NavLink to="/admin" onClick={() => setMobileOpen(false)}>
                  Return to Main Admin Dashboard
                </NavLink>
              </section>
            ) : null}
          </nav>
          {area === "admin" ? (
            <div className="portal-quick">
              <p>Quick access</p>
              <div>
                <Link to="/admin/tournaments">Add event</Link>
                <Link to="/admin/staff">Add user</Link>
                <Link to="/admin/content">Edit page</Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="portal-main">
        <header className="portal-header">
          <button type="button" className="portal-header__menu" aria-expanded={mobileOpen} aria-controls="staff-navigation" onClick={() => setMobileOpen((current) => !current)}>
            Menu
          </button>
          <div className="portal-header__title">
            <p>WAHSB</p>
            <strong>{PORTAL_LABEL[area]}</strong>
          </div>
          <span className="portal-header__slash" aria-hidden="true" />
          <p className="portal-header__system">Albany High School Bowling – Club Management System</p>
          <div className="portal-header__account">
            {area === "admin" ? (
              <Link className="portal-header__bell" to="/admin/announcements" aria-label="Announcements">
                <IconBell />
              </Link>
            ) : null}
            <span>{account}</span>
            <span className="visually-hidden">{role ? ROLE_LABEL[role] : "Staff"}</span>
            <button type="button" onClick={() => void signOut()}>
              Sign out
            </button>
          </div>
        </header>
        <main className="portal-content admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
