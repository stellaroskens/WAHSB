import { Link } from "react-router-dom"
import { AthleticHero } from "../components/AthleticHero"
import { ExternalLinkIcon } from "../components/header/icons"
import { PageMeta } from "../components/PageMeta"
import {
  club,
  pageBodies,
  pages,
  seasonRegistrationClosed,
  sterlingVolunteerInvitationUrl,
  sterlingVolunteersInfoUrl,
} from "../content/site"

const screeningConfigured = Boolean(sterlingVolunteerInvitationUrl)
const screeningHref = sterlingVolunteerInvitationUrl ?? sterlingVolunteersInfoUrl
const screeningLabel = screeningConfigured
  ? "Start volunteer background check"
  : "Learn about background checks"

export function Volunteer() {
  return (
    <div className="sw-page sw-volunteer">
      <PageMeta title={pages.volunteer.title} description={pages.volunteer.description} />
      <AthleticHero
        scene="club"
        eyebrow={pageBodies.volunteer.eyebrow}
        title={pageBodies.volunteer.title}
        subtitle={club.name}
        actions={
          <>
            <a className="sw-btn" href="#volunteer-background-checks">
              Background checks
            </a>
            <Link className="sw-btn sw-btn--ghost" to="/contact">
              Contact leadership
            </Link>
          </>
        }
      >
        {pageBodies.volunteer.intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <p>
          <strong>{seasonRegistrationClosed.heading}</strong>
        </p>
        <p>{seasonRegistrationClosed.description}</p>
        <p>{seasonRegistrationClosed.volunteerSecondary}</p>
      </AthleticHero>

      <section className="section" aria-labelledby="volunteer-ways-heading">
        <div className="wrap">
          <article className="card sw-volunteer__card">
            <h2 id="volunteer-ways-heading">{pageBodies.volunteer.waysHeading}</h2>
            <p>{pageBodies.volunteer.waysIntro}</p>
            <ul className="plain-list">
              {pageBodies.volunteer.opportunities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="sw-volunteer__actions">
              <Link className="sw-btn" to={pageBodies.volunteer.waysButtonTo}>
                {pageBodies.volunteer.waysButtonLabel}
              </Link>
            </p>
          </article>
        </div>
      </section>

      <section
        className="section"
        id="volunteer-background-checks"
        aria-labelledby="volunteer-background-heading"
      >
        <div className="wrap">
          <article className="card sw-volunteer__card">
            <h2 id="volunteer-background-heading">{pageBodies.volunteer.screeningHeading}</h2>
            {pageBodies.volunteer.screeningParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p className="sw-volunteer__notice" role="note">
              {pageBodies.volunteer.screeningNotice}
            </p>
            <p>{screeningConfigured ? pageBodies.volunteer.screeningReady : pageBodies.volunteer.screeningMissing}</p>
            <p className="sw-volunteer__actions">
              <a
                className="sw-btn sw-btn--plain"
                href={screeningHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {screeningLabel}
                <ExternalLinkIcon />
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
              <Link className="sw-btn sw-btn--outline" to="/contact">
                {pageBodies.volunteer.screeningAskLabel}
              </Link>
            </p>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="volunteer-transport-heading">
        <div className="wrap">
          <article className="card sw-volunteer__card">
            <h2 id="volunteer-transport-heading">{pageBodies.volunteer.transportHeading}</h2>
            {pageBodies.volunteer.transportParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p>{pageBodies.volunteer.transportListIntro}</p>
            <ul className="plain-list">
              {pageBodies.volunteer.transportItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>{pageBodies.volunteer.transportClosing}</p>
            <p className="sw-volunteer__actions">
              <Link className="sw-btn" to="/contact">
                {pageBodies.volunteer.transportButtonLabel}
              </Link>
            </p>
          </article>
        </div>
      </section>
    </div>
  )
}
