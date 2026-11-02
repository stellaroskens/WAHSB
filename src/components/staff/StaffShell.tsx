import { useState } from "react"
import { Link, NavLink, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../lib/auth/AuthProvider"
import { ADMIN_SECTIONS, adminSectionGroups } from "../../lib/auth/adminSections"
import { isSuperAdmin, primaryStaffRole } from "../../lib/auth/roles"
import { rolesFromUser } from "../../lib/auth/session"

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

export function StaffShell({ area }: { area: "admin" | "coach" | "club" }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const roles = rolesFromUser(user)
  const role = primaryStaffRole(roles)
  const groups = adminSectionGroups()
  const coachLinks = [
    { href: "/coach", title: "Coach dashboard" },
    { href: "/coach/bowlers", title: "Meet the Bowlers" },
  ]
  const clubLinks = [
    { href: "/team-administrator", title: "Club Administrator dashboard" },
    { href: "/team-administrator/bowlers", title: "Meet the Bowlers" },
  ]
  const links = area === "admin" ? null : area === "coach" ? coachLinks : clubLinks

  return (
    <div className="admin-shell">
      <div className="admin-frame">
        <aside className={menuOpen ? "admin-sidenav is-open" : "admin-sidenav"}>
          <p className="admin-sidenav__brand">AHSB</p>
          <p className="admin-sidenav__role">{role ? ROLE_LABEL[role] : "Staff"}</p>
          <nav id="staff-navigation" aria-label="Staff">
            {area === "admin"
              ? groups.map((group) => (
                  <div key={group}>
                    <p className="admin-sidenav__group">{group}</p>
                    {ADMIN_SECTIONS.filter((section) => section.group === group).map((section) => (
                      <NavLink
                        key={section.id}
                        to={section.href}
                        end={section.href === "/admin"}
                        onClick={() => setMenuOpen(false)}
                        className={() =>
                          sectionIsCurrent(section.href, location.pathname, location.search, location.hash) ? "active" : ""
                        }
                      >
                        {section.title}
                      </NavLink>
                    ))}
                  </div>
                ))
              : links?.map((item) => (
                  <NavLink key={item.href} to={item.href} end onClick={() => setMenuOpen(false)}>
                    {item.title}
                  </NavLink>
                ))}
            {area !== "admin" && isSuperAdmin(roles) ? (
              <NavLink to="/admin" onClick={() => setMenuOpen(false)}>
                Return to Main Admin Dashboard
              </NavLink>
            ) : null}
          </nav>
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
            <div className="admin-topbar__account">
              <span className="admin-topbar__email">{user?.email || "Signed-in staff"}</span>
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
