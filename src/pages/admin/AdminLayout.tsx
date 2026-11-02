import { NavLink, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../lib/auth/AuthProvider"
import { ADMIN_SECTIONS, adminSectionGroups } from "../../lib/auth/adminSections"

function sectionIsCurrent(href: string, pathname: string, search: string, hash: string): boolean {
  const [path, query] = href.split("#")[0].split("?")
  const hrefHash = href.includes("#") ? `#${href.split("#")[1]}` : ""
  if (path !== pathname) return false
  if (query) return search === `?${query}`
  if (hrefHash) return hash === hrefHash
  if (path === "/admin") return pathname === "/admin"
  return search === "" && hash === ""
}

export function AdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const groups = adminSectionGroups()

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-topbar__brand">
          <p className="admin-topbar__eyebrow">AHSB</p>
          <strong>Control Center</strong>
        </div>
        <div className="admin-topbar__account">
          <span className="admin-topbar__email">{user?.email}</span>
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
      <div className="admin-frame">
        <nav className="admin-sidenav" aria-label="Control Center">
          {groups.map((group) => (
            <div key={group}>
              <p className="admin-sidenav__group">{group}</p>
              {ADMIN_SECTIONS.filter((section) => section.group === group).map((section) => (
                <NavLink
                  key={section.id}
                  to={section.href}
                  end={section.href === "/admin"}
                  className={() =>
                    sectionIsCurrent(section.href, location.pathname, location.search, location.hash) ? "active" : ""
                  }
                  aria-current={
                    sectionIsCurrent(section.href, location.pathname, location.search, location.hash) ? "page" : undefined
                  }
                >
                  {section.title}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
