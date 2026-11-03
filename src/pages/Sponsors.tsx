import { type MouseEvent } from "react"
import { Link } from "react-router-dom"
import { AthleticHero } from "../components/AthleticHero"
import { PageMeta } from "../components/PageMeta"
import { SponsorInquiry } from "../components/SponsorInquiry"
import { FundraiserShare } from "../components/FundraiserShare"
import { PaymentOptions } from "../components/PaymentOptions"
import { WaysToContribute } from "../components/WaysToContribute"
import { library, pages, practiceLocation } from "../content/site"
import { placedImage } from "../content/publicImages"
import { visibleCommunitySponsors } from "../lib/content/siteContent"

const publicSponsors = visibleCommunitySponsors(library.communitySponsors)

function approvedLocalLogo(src: string | undefined): src is string {
  return Boolean(src && src.startsWith("/") && !src.includes("://"))
}

const lakeshoreDirections = practiceLocation.directions

function openAnchor(event: MouseEvent<HTMLAnchorElement>) {
  const hash = event.currentTarget.hash
  if (window.location.hash === hash) {
    event.preventDefault()
    window.dispatchEvent(new HashChangeEvent("hashchange"))
  }
}

function TeamIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="7.2" r="3.3" />
      <circle cx="5.6" cy="9" r="2.4" />
      <circle cx="18.4" cy="9" r="2.4" />
      <path d="M12 11.6c3.3 0 5.6 2 5.6 4.9V19H6.4v-2.5c0-2.9 2.3-4.9 5.6-4.9z" />
      <path d="M5.6 12.6c.5 0 1 .1 1.4.2-.9 1-1.5 2.3-1.6 3.7V19H1.5v-2.2c0-2.4 1.8-4.2 4.1-4.2zM18.4 12.6c2.3 0 4.1 1.8 4.1 4.2V19h-3.9v-2.5c-.1-1.4-.7-2.7-1.6-3.7.4-.1.9-.2 1.4-.2z" />
    </svg>
  )
}

function BowlerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="7" r="4" />
      <path d="M12 12.6c4.2 0 7.4 2.5 7.4 6V21H4.6v-2.4c0-3.5 3.2-6 7.4-6z" />
    </svg>
  )
}

export function Sponsors() {
  const copy = library.sponsorPage
  return (
    <div className="sw-page sw-sponsors">
      <PageMeta title={pages.sponsors.title} description={pages.sponsors.description} />
      <AthleticHero
        scene="sponsors"
        headingId="sponsor-options-heading"
        title={copy.heroTitle}
        subtitle={copy.heroSubtitle}
      >
        <p>{copy.heroBody}</p>
      </AthleticHero>

      <section className="section sponsor-options" aria-labelledby="sponsor-options-heading">
        <div className="wrap">
          <div className="sw-sponsors__options">
            <article className="sw-panel sw-sponsors__option">
              <span className="sw-icon-disc">
                <TeamIcon />
              </span>
              <div>
                <h2>{copy.teamHeading}</h2>
                <p>{copy.teamBody}</p>
                <a className="sw-btn" href="#sponsor-inquiry" onClick={openAnchor}>
                  {copy.teamButton}
                </a>
              </div>
            </article>
            <article className="sw-panel sw-sponsors__option">
              <span className="sw-icon-disc sw-icon-disc--navy">
                <BowlerIcon />
              </span>
              <div>
                <h2>{copy.bowlerHeading}</h2>
                <p>{copy.bowlerBody}</p>
                <a className="sw-btn" href="#bowler-lookup" onClick={openAnchor}>
                  {copy.bowlerButton}
                </a>
              </div>
            </article>
          </div>
          <p className="sw-sponsors__qr-note">
            <Link to={copy.qrTo}>{copy.qrLabel}</Link> {copy.qrBody}{" "}
            <Link to="/donate">{library.donations.donateButton}</Link> {copy.qrTail}
          </p>

          <div className="sw-sponsors__grid">
            <div className="sw-panel sw-sponsors__form">
              <h2 id="sponsor-form-heading">{copy.formHeading}</h2>
              <SponsorInquiry />
            </div>

            <div className="sw-sponsors__side">
              <section className="sw-panel sponsor-recognition" aria-labelledby="recognition-heading">
                <div className="sponsor-recognition__intro">
                  <h2 id="recognition-heading">{copy.recognitionHeading}</h2>
                  <p>{copy.recognitionIntro}</p>
                  <p>{copy.recognitionFollow}</p>
                </div>
                <div className="sponsor-recognition__cards">
                  <article className="sponsor-recognition__card sponsor-recognition__card--private">
                    <h3>{copy.privateHeading}</h3>
                    <p>{copy.privateBody}</p>
                    <p className="sponsor-recognition__label">{copy.privateLabel}</p>
                    <p>{copy.privateNote}</p>
                  </article>
                  <article className="sponsor-recognition__card">
                    <h3>{copy.shirtHeading}</h3>
                    <p className="sponsor-recognition__amount">{copy.shirtAmount}</p>
                    <p>{copy.shirtBody}</p>
                    <ul className="plain-list">
                      {copy.shirtItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <p className="sponsor-recognition__fine">{copy.shirtFine}</p>
                  </article>
                  <article className="sponsor-recognition__card">
                    <h3>{copy.homeHeading}</h3>
                    <p className="sponsor-recognition__amount">{copy.homeAmount}</p>
                    <p>{copy.homeBody}</p>
                    <ul className="plain-list">
                      {copy.homeItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <p className="sponsor-recognition__fine">{copy.homeFine}</p>
                  </article>
                </div>
                <p className="sponsor-recognition__note">{copy.inKindNote}</p>
              </section>
            </div>
          </div>

          <section className="sw-panel sponsor-contribute" aria-labelledby="ways-to-contribute-heading">
            <WaysToContribute preview="sponsorship" />
            <div className="connect-block connect-block--nested">
              <h2 id="support-payment-heading">{copy.paymentHeading}</h2>
              <p>{copy.paymentBody}</p>
              <PaymentOptions />
              <FundraiserShare />
            </div>
          </section>
        </div>
      </section>

      <div className="section sw-sponsors__community">
        <div className="wrap sw-sponsors__community-grid">
          <article className="sw-panel community-lakeshore__panel" aria-labelledby="community-lakeshore-heading">
            <div className="community-lakeshore__art">
              <img
                src={placedImage("lakeshore-logo", practiceLocation.logoSrc).src}
                width={practiceLocation.logoWidth}
                height={practiceLocation.logoHeight}
                alt={copy.lakeshoreLogoAlt}
                loading="lazy"
              />
            </div>
            <div className="community-lakeshore__copy">
              <p className="community-lakeshore__eyebrow">{copy.lakeshoreEyebrow}</p>
              <h2 id="community-lakeshore-heading">{copy.lakeshoreHeading}</h2>
              <p>{copy.lakeshoreBody}</p>
              <h3>{practiceLocation.name}</h3>
              <p>
                {practiceLocation.street}
                <br />
                {practiceLocation.locality}
              </p>
              <p>
                <a href={practiceLocation.phoneHref}>{practiceLocation.phone}</a>
              </p>
              <p>{copy.lakeshoreDetail}</p>
              <div className="community-lakeshore__actions">
                <a
                  className="sw-btn sw-btn--outline sw-btn--plain"
                  href={lakeshoreDirections}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {copy.directionsLabel}
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
                <a
                  className="sw-btn sw-btn--outline sw-btn--plain"
                  href={practiceLocation.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {copy.websiteLabel}
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
                <a className="sw-btn sw-btn--outline sw-btn--plain" href={practiceLocation.phoneHref}>
                  {copy.callLabel}
                </a>
              </div>
            </div>
          </article>

          <div className="sw-panel community-sponsor-grid" aria-labelledby="community-sponsor-grid-heading" role="region">
            <div className="community-sponsor-grid__intro">
              <h2 id="community-sponsor-grid-heading">{copy.supportersHeading}</h2>
              <p>{copy.supportersBody}</p>
            </div>
            {publicSponsors.length === 0 ? (
              <div className="community-sponsor-grid__empty">
                <h3>{copy.emptyHeading}</h3>
                <p>{copy.emptyBody}</p>
                <a className="sw-btn community-sponsor-grid__action" href="#sponsor-options-heading">
                  {copy.emptyButton}
                </a>
              </div>
            ) : (
              <ul className="community-sponsor-grid__cards">
                {publicSponsors.map((sponsor) => (
                  <li className="community-sponsor-grid__card" key={sponsor.id}>
                    {approvedLocalLogo(sponsor.logoSrc) ? (
                      <img
                        src={sponsor.logoSrc}
                        alt={sponsor.logoAlt?.trim() || `${sponsor.name} logo`}
                      />
                    ) : null}
                    <h3>{sponsor.name}</h3>
                    {sponsor.detail ? <p>{sponsor.detail}</p> : null}
                    {sponsor.href ? (
                      <a href={sponsor.href} target="_blank" rel="noopener noreferrer">
                        Visit {sponsor.name}
                        <span className="visually-hidden"> (opens in a new tab)</span>
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
