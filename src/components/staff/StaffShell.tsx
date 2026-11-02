import { useState } from "react"
import { Link, NavLink, Outlet, useLocation } from "react-router-dom"
import { websiteLogoTransparent } from "../../content/media"
import { seasonRegistrationClosed } from "../../content/site"
import { useAuth } from "../../lib/auth/AuthProvider"
import { isSuperAdmin, primaryStaffRole } from "../../lib/auth/roles"
import { rolesFromUser, usernameFromUser } from "../../lib/auth/session"

function sectionIsCurrent(href: string, pathname: string, search: string, hash: string): boolean {
  const [path, query] = href.split("#")[0].split("?")
  const hrefHash = href.includes("#") ? `#${href.split("#")[1]}` : ""
  if (path !== pathname) return false
  if (query) return search === `?${query}`
  if (hrefHash) return hash === hrefHash
  if (path === "/admin" || path === "/coach" || path === "/team-administrator") return pathname === path
  return search === "" && hash === ""
}

const ROLE_LABEL = {
  super_admin: "Super Administrator",
  coach: "Coach",
  team_administrator: "Club Administrator",
} as const

const ADMIN_NAV = [
  { href: "/admin", title: "Dashboard" },
  { href: "/admin/announcements", title: "Announcements" },
  { href: "/admin/club", title: "Team Management" },
  { href: "/admin/bowlers", title: "Bowlers" },
  { href: "/admin/content?page=practices", title: "Practices" },
  { href: "/admin/tournaments", title: "Tournaments" },
  { href: "/admin/media", title: "Media" },
  { href: "/admin/settings", title: "Settings" },
]

const SEASON_LABEL = `${seasonRegistrationClosed.heading.match(/\d{4}–\d{4}/)?.[0] ?? "Current"} Season`

export function StaffShell({ area }: { area: "admin" | "coach" | "club" }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const roles = rolesFromUser(user)
  const role = primaryStaffRole(roles)
  const displayName = usernameFromUser(user) || user?.email || "Signed-in staff"
  const coachLinks = [
    { href: "/coach", title: "Dashboard" },
    { href: "/coach/bowlers", title: "Bowlers" },
  ]
  const clubLinks = [
    { href: "/team-administrator", title: "Dashboard" },
    { href: "/team-administrator/bowlers", title: "Bowlers" },
  ]
  const links = area === "admin" ? ADMIN_NAV : area === "coach" ? coachLinks : clubLinks

  return (
    <div className="admin-shell">
      <div className="admin-frame">
        <aside className={menuOpen ? "admin-sidenav is-open" : "admin-sidenav"}>
          <Link className="admin-sidenav__brand" to={area === "coach" ? "/coach" : area === "club" ? "/team-administrator" : "/admin"}>
            <img src={websiteLogoTransparent.src} width={160} height={48} alt="Albany High School Bowling" />
          </Link>
          <p className="admin-sidenav__role">{role ? ROLE_LABEL[role] : "Staff"}</p>
          <nav id="staff-navigation" aria-label="Staff">
            {links.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === "/admin" || item.href === "/coach" || item.href === "/team-administrator"}
                onClick={() => setMenuOpen(false)}
                className={() => (sectionIsCurrent(item.href, location.pathname, location.search, location.hash) ? "active" : "")}
              >
                {item.title}
              </NavLink>
            ))}
            {area !== "admin" && isSuperAdmin(roles) ? (
              <NavLink to="/admin" onClick={() => setMenuOpen(false)}>
                Return to Main Admin Dashboard
              </NavLink>
            ) : null}
          </nav>
          <button
            type="button"
            className="admin-sidenav__signout"
            onClick={async () => {
              await logout()
              window.location.assign("/staff/login")
            }}
          >
            Sign out
          </button>
        </aside>
        <div className="admin-workspace">
          <header className="admin-topbar">
            <button
              type="button"
              className="admin-menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="staff-navigation"
              onClick={() => setMenuOpen((current) => !current)}
            >
              {menuOpen ? "Close menu" : "Menu"}
            </button>
            <p className="admin-crumbs">
              <Link to="/">Public website</Link>
              <span aria-hidden="true"> / </span>
              <span>{area === "admin" ? "Control Center" : area === "coach" ? "Coach" : "Club Administrator"}</span>
            </p>
            <p className="admin-topbar__season">{SEASON_LABEL}</p>
            <div className="admin-topbar__account">
              {area === "admin" ? (
                <Link className="admin-topbar__bell" to="/admin/announcements">
                  Announcements
                </Link>
              ) : null}
              <span className="admin-topbar__email">{displayName}</span>
              <span className="admin-topbar__role">{role ? ROLE_LABEL[role] : "Staff"}</span>
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
      </div>
    </div>
  )
}
