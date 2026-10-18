import { useEffect, useRef, useState } from "react"
import { NavLink } from "react-router-dom"
import { nav } from "../content/site"
import { AccountButton } from "./header/AccountButton"
import { CartLink } from "./header/CartLink"
import { BurgerIcon } from "./header/icons"
import { SiteSearch } from "./header/SiteSearch"

export function Header() {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const firstLink = menuRef.current?.querySelector("nav a")
    if (firstLink instanceof HTMLElement) firstLink.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    function onPointer(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("pointerdown", onPointer)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("pointerdown", onPointer)
    }
  }, [open])

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <div className="topbar__menu" ref={menuRef}>
          <button
            ref={buttonRef}
            type="button"
            className="header-icon topbar__toggle"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <BurgerIcon />
            <span className="header-icon__label">{open ? "Close" : "Menu"}</span>
          </button>
          <nav id="site-menu" className="topbar__nav" aria-label="Primary" hidden={!open}>
            <ul>
              {nav.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.end} onClick={() => setOpen(false)}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <SiteSearch />

        <div className="topbar__tools">
          <NavLink className="topbar__donate" to="/bowl-a-thon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" />
            </svg>
            <span>
              Donate<span className="topbar__donate-extra"> or Pledge</span>
            </span>
          </NavLink>
          <AccountButton />
          <CartLink />
        </div>
      </div>
    </header>
  )
}
