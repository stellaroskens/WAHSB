import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"
import { useNavigate } from "react-router-dom"
import { searchSite } from "../../content/searchIndex"

export function SiteSearch({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const navigate = useNavigate()
  const inputId = useId()
  const listId = useId()
  const rootRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [active, setActive] = useState(0)
  const hits = searchSite(query)

  useEffect(() => {
    if (!open && !expanded) return
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setExpanded(false)
      }
    }
    document.addEventListener("pointerdown", onPointer)
    return () => document.removeEventListener("pointerdown", onPointer)
  }, [open, expanded])

  function go(to: string) {
    setOpen(false)
    setExpanded(false)
    setQuery("")
    navigate(to)
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && hits.length) {
      event.preventDefault()
      setOpen(true)
      setActive((value) => (value + 1) % hits.length)
    } else if (event.key === "ArrowUp" && hits.length) {
      event.preventDefault()
      setActive((value) => (value - 1 + hits.length) % hits.length)
    } else if (event.key === "Enter") {
      event.preventDefault()
      const hit = hits[active] ?? hits[0]
      if (hit) go(hit.to)
      else setOpen(true)
    } else if (event.key === "Escape") {
      setOpen(false)
      setExpanded(false)
    }
  }

  return (
    <form
      ref={rootRef}
      className={`site-search site-search--${tone}${expanded ? " is-expanded" : ""}`}
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        const hit = hits[active] ?? hits[0]
        if (hit) go(hit.to)
        else setOpen(true)
      }}
    >
      <button
        type="button"
        className="site-search__toggle"
        aria-label="Search the site"
        aria-expanded={expanded}
        onClick={() => {
          setExpanded(true)
          requestAnimationFrame(() => inputRef.current?.focus())
        }}
      >
        <SearchIcon />
      </button>
      <div className="site-search__field">
        <label className="visually-hidden" htmlFor={inputId}>
          Search the site
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          placeholder="Search…"
          autoComplete="off"
          value={query}
          role="combobox"
          aria-expanded={open && query.trim() !== ""}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && hits[active] ? `${listId}-${active}` : undefined}
          onChange={(event) => {
            setQuery(event.target.value)
            setActive(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        <button type="submit" className="site-search__submit" aria-label="Go to the first result">
          <SearchIcon />
        </button>
        {open && query.trim() ? (
          <ul
            id={listId}
            className="site-search__results"
            role={hits.length === 0 ? "status" : "listbox"}
            aria-label={hits.length === 0 ? undefined : "Search results"}
          >
            {hits.length === 0 ? (
              <li className="site-search__empty">No matching pages.</li>
            ) : null}
            {hits.map((hit, index) => (
              <li
                key={hit.to}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === active}
                className={index === active ? "is-active" : undefined}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => go(hit.to)}
                onPointerEnter={() => setActive(index)}
              >
                <span>{hit.label}</span>
                <small>{hit.detail}</small>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </form>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}
