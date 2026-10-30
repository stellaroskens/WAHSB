import { useEffect, useRef, useState } from "react"
import { Link, NavLink } from "react-router-dom"
import { AccountButton } from "../components/header/AccountButton"
import { SiteSearch } from "../components/header/SiteSearch"
import { PageMeta } from "../components/PageMeta"
import { fundraisers } from "../content/fundraisers"
import { clothingLogo, homeHeroBanner, websiteLogo } from "../content/media"
import { nav, pageBodies, pages, practiceLocation, seasonRegistrationClosed } from "../content/site"

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
            <Link className="review-header-donate" to={pageBodies.home.hero.buttonTo} onClick={() => setOpen(false)}>
              {pageBodies.home.hero.buttonLabel}
            </Link>
            <AccountButton />
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
          alt={pageBodies.home.hero.imageAlt}
        />
        <h1 id="review-hero-heading" className="review-hero__title">
          {pageBodies.home.hero.heading}
        </h1>
        <div className="review-hero__cta">
          <p>{pageBodies.home.hero.description}</p>
          <Link className="review-pledge" to={pageBodies.home.hero.buttonTo}>
            {pageBodies.home.hero.buttonLabel}
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
            <span className="review-club__divider-label">{pageBodies.home.club.eyebrow}</span>
            <span className="review-club__rule review-club__rule--right" aria-hidden="true" />
          </div>

          <div className="review-club__grid">
            <div className="review-club__content">
              <h2 id="review-club-title" className="review-club__heading">
                <span className="is-navy">{pageBodies.home.club.headingNavy}</span>
                <span className="is-red">{pageBodies.home.club.headingRed}</span>
              </h2>

              <p className="review-club__description">{pageBodies.home.club.description}</p>

              <div className="review-club__actions">
                <Link to={pageBodies.home.club.primaryTo} className="review-club__button review-club__button--primary">
                  {pageBodies.home.club.primaryLabel} <span aria-hidden="true">→</span>
                </Link>
                <Link to={pageBodies.home.club.secondaryTo} className="review-club__button review-club__button--secondary">
                  {pageBodies.home.club.secondaryLabel} <span aria-hidden="true">→</span>
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

      <section className="review-volunteers" aria-labelledby="season-registration-closed-heading">
        <div className="review-volunteers__inner">
          <article className="review-volunteers__card">
            <h2 id="season-registration-closed-heading">{seasonRegistrationClosed.heading}</h2>
            <p>{seasonRegistrationClosed.description}</p>
            <p>{seasonRegistrationClosed.volunteerSecondary}</p>
            <Link className="review-volunteers__link" to={seasonRegistrationClosed.volunteerCtaTo}>
              {seasonRegistrationClosed.volunteerCtaLabel} <span aria-hidden="true">→</span>
            </Link>
          </article>
        </div>
      </section>

      <section className="review-cards" aria-label="Practices, team gear, and tournaments">
        <div className="review-cards__inner">
          <div className="review-cards__grid">
            <article className="review-cards__card">
              <div className="review-cards__visual review-cards__visual--lanes">
                <img src="/images/home-card-practices.png" width={510} height={185} alt={pageBodies.home.cards[0].imageAlt} />
              </div>
              <div className="review-cards__body">
                <h2>{pageBodies.home.cards[0].heading}</h2>
                <p>{pageBodies.home.cards[0].description}</p>
                <Link className="review-cards__link" to={pageBodies.home.cards[0].linkTo}>
                  {pageBodies.home.cards[0].linkLabel} <span aria-hidden="true">→</span>
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
                  alt={pageBodies.home.cards[1].imageAlt}
                />
              </div>
              <div className="review-cards__body">
                <h2>{pageBodies.home.cards[1].heading}</h2>
                <p>{pageBodies.home.cards[1].description}</p>
                <Link className="review-cards__link" to={pageBodies.home.cards[1].linkTo}>
                  {pageBodies.home.cards[1].linkLabel} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>

            <article className="review-cards__card">
              <div className="review-cards__visual review-cards__visual--ball">
                <img src="/images/home-card-tournaments.png" width={175} height={145} alt={pageBodies.home.cards[2].imageAlt} />
              </div>
              <div className="review-cards__body">
                <h2>{pageBodies.home.cards[2].heading}</h2>
                <p>{pageBodies.home.cards[2].description}</p>
                <Link className="review-cards__link" to={pageBodies.home.cards[2].linkTo}>
                  {pageBodies.home.cards[2].linkLabel} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="review-fundraisers" aria-labelledby="review-fundraisers-title">
        <div className="review-fundraisers__inner">
          <h2 id="review-fundraisers-title">{pageBodies.home.fundraisersHeading}</h2>
          <div className="review-fundraisers__grid">
            {fundraisers.map((event) => (
              <article className="review-fundraisers__card" key={event.id}>
                <p className="review-fundraisers__date">{event.when}</p>
                <h3>{event.business}</h3>
                <p>{event.place}</p>
                <p className="review-fundraisers__time">{event.time}</p>
                <Link to={`/fundraisers#${event.id}`}>
                  {pageBodies.home.fundraiserLinkLabel} <span aria-hidden="true">→</span>
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
            alt={`${practiceLocation.name} logo`}
            loading="lazy"
          />
          <div className="review-thanks__copy">
            <h2 id="review-thanks-title">{pageBodies.home.thanks.heading}</h2>
            <p>{pageBodies.home.thanks.description}</p>
            <p className="review-thanks__place">
              {practiceLocation.name}
              <br />
              {practiceLocation.street}
              <br />
              {practiceLocation.locality}
            </p>
            <div className="review-thanks__actions">
              <a href={practiceLocation.directions} target="_blank" rel="noopener noreferrer">
                {pageBodies.home.thanks.directionsLabel}
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
              <a href={practiceLocation.website} target="_blank" rel="noopener noreferrer">
                {pageBodies.home.thanks.websiteLabel}
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
            {pageBodies.home.footerTitle}
            <span aria-hidden="true"> · </span>
            {pageBodies.home.footerEventLabel}
          </h2>
          <div className="review-footer__divider" />
          <nav className="review-footer__nav" aria-label="Homepage footer navigation">
            <Link to="/">Home</Link>
            <Link to="/bowl-a-thon">Event</Link>
            <Link to="/our-club#coaches">Our team</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/fundraisers">Fundraisers</Link>
            <Link to="/volunteer">Volunteer</Link>
            <Link to="/team-gear">Team Gear</Link>
            <Link to="/contact">Contact Us</Link>
          </nav>
        </div>
      </footer>
      </div>
    </div>
  )
}
