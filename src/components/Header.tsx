import { useCallback, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { nav } from "../content/site"
import { AccountButton } from "./header/AccountButton"
import { BurgerIcon } from "./header/icons"
import { PublicMenu } from "./PublicMenu"
import { SiteSearch } from "./header/SiteSearch"

export function Header() {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const closeMenu = useCallback(() => {
    setOpen(false)
    buttonRef.current?.focus()
  }, [])

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <div className="topbar__menu">
          <button
            ref={buttonRef}
            type="button"
            className="header-icon topbar__toggle"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => (open ? closeMenu() : setOpen(true))}
          >
            <BurgerIcon />
            <span className="header-icon__label">{open ? "Close" : "Menu"}</span>
          </button>
          <PublicMenu id="site-menu" open={open} items={nav.filter((item) => !item.hidden)} onClose={closeMenu} />
        </div>

        <SiteSearch />

        <div className="topbar__tools">
          <Link className="topbar__donate" to="/donate">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" />
            </svg>
            <span>
              Donate
            </span>
          </Link>
          <AccountButton />
        </div>
      </div>
    </header>
  )
}
