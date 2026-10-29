import { useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Footer } from "./Footer"
import { Header } from "./Header"

export function Layout() {
  const { pathname, hash, state } = useLocation()
  const keepScroll = Boolean((state as { keepScroll?: boolean } | null)?.keepScroll)

  useEffect(() => {
    if (keepScroll) return
    const frame = requestAnimationFrame(() => {
      if (hash) {
        const id = decodeURIComponent(hash.slice(1))
        const target = document.getElementById(id)
        if (target) {
          const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
          target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
          return
        }
      }
      window.scrollTo(0, 0)
    })
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash])

  const homeStage = pathname === "/" || (import.meta.env.DEV && pathname === "/home-review")
  const showSiteChrome = !homeStage

  return (
    <div className="site">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {showSiteChrome && <Header />}
      <main id="main">
        <Outlet />
      </main>
      {showSiteChrome && <Footer />}
    </div>
  )
}
