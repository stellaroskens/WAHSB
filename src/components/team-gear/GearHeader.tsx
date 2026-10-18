import { useEffect, useId, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { nav } from "../../content/site"
import { categories, logos, products } from "../../content/teamGearCatalog"
import { useGear } from "./gearContext"

type Hit = { id: string; kind: "product" | "category" | "logo" | "page"; label: string; detail: string }

export function GearHeader() {
  const navigate = useNavigate()
  const menuId = useId()
  const searchId = useId()
  const listId = useId()
  const menuRef = useRef<HTMLDivElement>(null)
  const {
    cartCount,
    menuOpen,
    setMenuOpen,
    search,
    setSearch,
    searchOpen,
    setSearchOpen,
    setCartOpen,
    setProduct,
    setCategory,
  } = useGear()

  const query = search.trim().toLowerCase()
  const hits: Hit[] = query
    ? [
        ...products
          .filter((item) => item.name.toLowerCase().includes(query))
          .map((item) => ({ id: item.id, kind: "product" as const, label: item.name, detail: "Product" })),
        ...categories
          .filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(query))
          .map((item) => ({ id: item.id, kind: "category" as const, label: item.label, detail: "Spirit wear" })),
        ...logos
          .filter((item) => item.id !== "none" && item.name.toLowerCase().includes(query))
          .map((item) => ({
            id: item.id,
            kind: "logo" as const,
            label: item.name,
            detail: item.available ? "Logo" : "Logo artwork not on file",
          })),
        ...nav
          .filter((item) => item.label.toLowerCase().includes(query))
          .map((item) => ({ id: item.to, kind: "page" as const, label: item.label, detail: "Page" })),
      ]
    : []

  const choose = (hit: Hit) => {
    setSearchOpen(false)
    if (hit.kind === "page") {
      navigate(hit.id)
      return
    }
    if (hit.kind === "product") setProduct(hit.id)
    if (hit.kind === "category") setCategory(hit.id)
    document.getElementById(hit.kind === "logo" ? "gear-logos" : "customize")?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false)
    }
    const onPointer = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onPointer)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onPointer)
    }
  }, [menuOpen, setMenuOpen])

  return (
    <header className="gear-bar">
      <div className="gear-menu" ref={menuRef}>
        <button
          type="button"
          className="gear-bar__menu"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className="gear-burger" aria-hidden="true" />
          Menu
        </button>
        {menuOpen ? (
          <nav id={menuId} className="gear-menu__panel" aria-label="Team gear menu">
            <ul>
              {nav.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} onClick={() => setMenuOpen(false)}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
      <form
        className="gear-search"
        role="search"
        onSubmit={(event) => {
          event.preventDefault()
          if (hits[0]) choose(hits[0])
        }}
      >
        <label className="visually-hidden" htmlFor={searchId}>
          Search team gear
        </label>
        <input
          id={searchId}
          type="search"
          placeholder="Search"
          value={search}
          role="combobox"
          aria-expanded={searchOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          onChange={(event) => {
            setSearch(event.target.value)
            setSearchOpen(true)
          }}
          onFocus={() => setSearchOpen(true)}
        />
        {searchOpen && query ? (
          <ul id={listId} className="gear-search__results" role="listbox">
            {hits.length === 0 ? <li className="gear-search__empty">No matching gear or pages.</li> : null}
            {hits.map((hit) => (
              <li key={`${hit.kind}-${hit.id}`} role="option" aria-selected="false">
                <button type="button" onClick={() => choose(hit)}>
                  <span>{hit.label}</span>
                  <small>{hit.detail}</small>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </form>
      <button type="button" className="gear-cart" onClick={() => setCartOpen(true)}>
        <span className="gear-cart__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path d="M6 6h15l-2 9H8L6 6z" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M6 6 5 3H2" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="9" cy="20" r="1.4" fill="currentColor" />
            <circle cx="17" cy="20" r="1.4" fill="currentColor" />
          </svg>
        </span>
        Cart
        <span className="gear-cart__count">{cartCount}</span>
        <span className="visually-hidden">{cartCount === 1 ? "1 item" : `${cartCount} items`}</span>
      </button>
    </header>
  )
}
