import { useEffect, useRef, useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { AccountButton } from "../components/header/AccountButton"
import { CartLink } from "../components/header/CartLink"
import { SiteSearch } from "../components/header/SiteSearch"
import { PageMeta } from "../components/PageMeta"
import { fundraisers } from "../content/fundraisers"
import { clothingLogo, homeHeroBanner, websiteLogo } from "../content/media"
import { nav, pages, practiceLocation } from "../content/site"

const links = nav

export function HomeReview() {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return
    const firstLink = menuRef.current?.querySelector("a")
    if (firstLink instanceof HTMLElement) firstLink.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open])

  return (
    <div className="home-review">
      <PageMeta title={pages.home.title} description={pages.home.description} />
      <div className="review-stage">
      <header className="review-header">
        <div className="review-bar">
          <nav
            ref={menuRef}
            id="review-menu"
            className={open ? "review-nav is-open" : "review-nav"}
            aria-label="Primary"
          >
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={item.to === "/" ? "is-current" : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="review-tools">
            <SiteSearch tone="light" />
            <Link className="review-header-donate" to="/bowl-a-thon" onClick={() => setOpen(false)}>
              Donate or Pledge
            </Link>
            <AccountButton />
            <CartLink />
            <button
              ref={buttonRef}
              type="button"
              className="review-menu"
              aria-expanded={open}
              aria-controls="review-menu"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? "Close" : "Menu"}
            </button>
          </div>
        </div>
      </header>

      <section className="review-hero" aria-labelledby="review-hero-heading">
        <img
          className="review-hero-art"
          src={homeHeroBanner.src}
          srcSet={homeHeroBanner.srcSet}
          sizes="(max-width: 1280px) 100vw, 1280px"
          width={homeHeroBanner.width}
          height={homeHeroBanner.height}
          fetchPriority="high"
          alt="Bowl-A-Thon"
        />
        <h1 id="review-hero-heading" className="review-hero__title">
          Strike up support for our bowlers.
        </h1>
        <div className="review-hero__cta">
          <p>Give a flat donation or pledge an amount per pin.</p>
          <Link className="review-pledge" to="/bowl-a-thon">
            Donate or Pledge
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12h12M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </section>

      <section className="review-club" aria-labelledby="review-club-title">
        <div className="review-club__inner">
          <div className="review-club__divider">
            <span className="review-club__rule review-club__rule--left" aria-hidden="true" />
            <span className="review-club__divider-mark" aria-hidden="true" />
            <span className="review-club__divider-label">More than a game</span>
            <span className="review-club__rule review-club__rule--right" aria-hidden="true" />
          </div>

          <div className="review-club__grid">
            <div className="review-club__content">
              <h2 id="review-club-title" className="review-club__heading">
                <span className="is-navy">Build skills.</span>
                <span className="is-red">Find your team.</span>
              </h2>

              <p className="review-club__description">
                Albany High School Bowling welcomes students of all experience levels. We build focus,
                determination, confidence, teamwork, and school pride — on and off the lanes.
              </p>

              <div className="review-club__actions">
                <Link to="/our-club" className="review-club__button review-club__button--primary">
                  Learn more about our club <span aria-hidden="true">→</span>
                </Link>
                <Link to="/our-club#coaches" className="review-club__button review-club__button--secondary">
                  Meet our team <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>

            <div className="review-club__mark">
              {/* No approved team photograph. Website logo stands in; it is not a photo of bowlers. */}
              <img
                src={websiteLogo.src}
                srcSet={websiteLogo.srcSet}
                sizes="(max-width: 700px) 70vw, 288px"
                width={websiteLogo.width}
                height={websiteLogo.height}
                alt=""
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="review-cards" aria-label="Practices, team gear, and tournaments">
        <div className="review-cards__inner">
          <div className="review-cards__grid">
            <article className="review-cards__card">
              <div className="review-cards__visual review-cards__visual--lanes">
                <img src="/images/home-card-practices.png" width={510} height={185} alt="" />
              </div>
              <div className="review-cards__body">
                <h2>Practices</h2>
                <p>Practices are located at Lakeshore Lanes in Albany.</p>
                <Link className="review-cards__link" to="/practices">
                  Practice details <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>

            <article className="review-cards__card">
              <div className="review-cards__visual review-cards__visual--shirt">
                <img
                  src={clothingLogo.src}
                  width={clothingLogo.width}
                  height={clothingLogo.height}
                  loading="lazy"
                  alt="Albany High School Bowling clothing logo"
                />
              </div>
              <div className="review-cards__body">
                <h2>Team gear</h2>
                <p>Support the team with custom Albany High School Bowling gear.</p>
                <Link className="review-cards__link" to="/team-gear">
                  View team gear <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>

            <article className="review-cards__card">
              <div className="review-cards__visual review-cards__visual--ball">
                <img src="/images/home-card-tournaments.png" width={175} height={145} alt="" />
              </div>
              <div className="review-cards__body">
                <h2>Tournaments</h2>
                <p>Find upcoming tournament information, schedules, and locations.</p>
                <Link className="review-cards__link" to="/tournaments">
                  View schedule <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="review-fundraisers" aria-labelledby="review-fundraisers-title">
        <div className="review-fundraisers__inner">
          <h2 id="review-fundraisers-title">Upcoming fundraisers</h2>
          <div className="review-fundraisers__grid">
            {fundraisers.map((event) => (
              <article className="review-fundraisers__card" key={event.id}>
                <p className="review-fundraisers__date">{event.when}</p>
                <h3>{event.business}</h3>
                <p>{event.place}</p>
                <p className="review-fundraisers__time">{event.time}</p>
                <Link to={`/fundraisers#${event.id}`}>
                  View fundraiser details <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="review-thanks" aria-labelledby="review-thanks-title">
        <div className="review-thanks__inner">
          <img
            src={practiceLocation.logoSrc}
            width={practiceLocation.logoWidth}
            height={practiceLocation.logoHeight}
            alt="Lakeshore Lanes logo"
            loading="lazy"
          />
          <div className="review-thanks__copy">
            <h2 id="review-thanks-title">Thank you, Lakeshore Lanes!</h2>
            <p>
              Albany High School Bowling appreciates Lakeshore Lanes for supporting our
              student athletes through lane access and practice time. Your support helps
              our bowlers develop their skills, build confidence, and grow together as a
              team.
            </p>
            <p className="review-thanks__place">
              {practiceLocation.name}
              <br />
              {practiceLocation.street}
              <br />
              {practiceLocation.locality}
            </p>
            <div className="review-thanks__actions">
              <a href={practiceLocation.directions} target="_blank" rel="noopener noreferrer">
                Get directions
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
              <a href={practiceLocation.website} target="_blank" rel="noopener noreferrer">
                Visit website
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
              <a href={practiceLocation.phoneHref}>Call {practiceLocation.name}</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="review-footer">
        <div className="review-footer__inner">
          <h2 className="review-footer__title">
            Albany High School Bowling
            <span aria-hidden="true"> · </span>
            Bowl-A-Thon
          </h2>
          <div className="review-footer__divider" />
          <nav className="review-footer__nav" aria-label="Homepage footer navigation">
            <Link to="/">Home</Link>
            <Link to="/bowl-a-thon">Event</Link>
            <Link to="/our-club#coaches">Our team</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/fundraisers">Fundraisers</Link>
            <Link to="/team-gear">Team Gear</Link>
            <Link to="/contact">Contact Us</Link>
          </nav>
        </div>
      </footer>
      </div>
    </div>
  )
}
