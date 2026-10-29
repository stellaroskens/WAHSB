import { Link } from "react-router-dom"
import { AthleticHero, SectionHeading } from "../components/AthleticHero"
import { PageMeta } from "../components/PageMeta"
import { coachPortraits, websiteLogo } from "../content/media"
import { bakerFrames, club, coaches, pageBodies, pages, seasonRegistrationClosed } from "../content/site"

export function OurClub() {
  return (
    <div className="sw-page sw-club">
      <PageMeta title={pages.club.title} description={pages.club.description} />
      <AthleticHero
        scene="club"
        title={pageBodies.club.heroTitle}
        subtitle={club.name}
        actions={
          <>
            <a className="sw-btn" href="#coaches">
              {pageBodies.club.coachesButtonLabel}
            </a>
            <Link className="sw-btn sw-btn--ghost" to={seasonRegistrationClosed.volunteerCtaTo}>
              {seasonRegistrationClosed.volunteerCtaLabel}
            </Link>
          </>
        }
        art={
          <div className="sw-logo-badge">
            <img
              src={websiteLogo.src}
              srcSet={websiteLogo.srcSet}
              sizes="(max-width: 900px) 70vw, 352px"
              width={websiteLogo.width}
              height={websiteLogo.height}
              alt="Albany High School Bowling logo"
            />
          </div>
        }
      >
        {pageBodies.club.intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <p>
          <strong>{seasonRegistrationClosed.heading}</strong>
        </p>
        <p>{seasonRegistrationClosed.description}</p>
        <p>{seasonRegistrationClosed.volunteerSecondary}</p>
      </AthleticHero>

      <section className="section sw-club__coaches" id="coaches" aria-labelledby="coaches-heading">
        <div className="wrap">
          <SectionHeading id="coaches-heading" title={pageBodies.club.coachesHeading}>
            <p>{pageBodies.club.coachesNote}</p>
          </SectionHeading>
          <div className="sw-club__coach-grid">
            {coaches.map((coach) => (
              <article className="sw-coach" key={coach.id}>
                <div className="sw-coach__head">
                  <img
                    className="sw-coach__photo"
                    src={coachPortraits[coach.id].src}
                    srcSet={coachPortraits[coach.id].srcSet}
                    sizes="(max-width: 700px) 40vw, 220px"
                    width={1254}
                    height={1254}
                    alt={coach.name}
                    loading="lazy"
                  />
                  <div className="sw-coach__id">
                    <p className="sw-chip sw-chip--red">{coach.role}</p>
                    <h3>{coach.name}</h3>
                  </div>
                </div>
                <p className="sw-coach__bio">{coach.summary}</p>
              </article>
            ))}
          </div>
          <article className="sw-coach sw-coach--admin">
            <span className="sw-icon-disc sw-icon-disc--navy" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zm0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5z" />
              </svg>
            </span>
            <div className="sw-coach__id">
              <p className="sw-chip">{pageBodies.club.administratorTitle}</p>
              <h3>{pageBodies.club.administratorName}</h3>
            </div>
          </article>
        </div>
      </section>

      <section className="section" aria-label="About the club">
        <div className="wrap sw-club__info-grid">
          <article className="card club-info sw-club__info" aria-labelledby="team-sport-heading">
            <h2 id="team-sport-heading">{pageBodies.club.teamSport.heading}</h2>
            {pageBodies.club.teamSport.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <ul className="plain-list">
              {pageBodies.club.teamSport.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <ol className="sw-baker" aria-label="Standard five-bowler Baker lineup">
              {bakerFrames.map((row) => (
                <li key={row.bowler}>
                  <span className="sw-baker__bowler">{row.bowler}</span>
                  <span className="sw-baker__frames">{row.frames}</span>
                </li>
              ))}
            </ol>
            <p>{pageBodies.club.teamSport.lineupNote}</p>
            <p className="club-action">
              <Link className="sw-btn" to={pageBodies.club.teamSport.buttonTo}>
                {pageBodies.club.teamSport.buttonLabel}
              </Link>
            </p>
          </article>

          <article className="card club-info sw-club__info" aria-labelledby="volunteer-heading">
            <h2 id="volunteer-heading">{pageBodies.club.volunteers.heading}</h2>
            <p>
              <strong>{seasonRegistrationClosed.heading}</strong>
            </p>
            <p>{seasonRegistrationClosed.description}</p>
            <p>{seasonRegistrationClosed.volunteerSecondary}</p>
            {pageBodies.club.volunteers.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <ul className="plain-list">
              {pageBodies.club.volunteers.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="club-action">
              <Link className="sw-btn" to={seasonRegistrationClosed.volunteerCtaTo}>
                {seasonRegistrationClosed.volunteerCtaLabel}
              </Link>
            </p>
          </article>

          <article className="card club-info sw-club__info sw-club__info--wide" aria-labelledby="college-heading">
            <div className="sw-club__college">
              <div>
                <h2 id="college-heading">{pageBodies.club.college.heading}</h2>
                <p>{pageBodies.club.college.intro}</p>
                <ul className="plain-list">
                  {pageBodies.club.college.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="sw-club__links">
                <p>{pageBodies.club.college.disclaimer}</p>
                <ul>
                  {pageBodies.club.college.links.map((link) => (
                    <li key={link.href}>
                      <a href={link.href} target="_blank" rel="noopener noreferrer">
                        {link.label}
                        <span className="visually-hidden"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="club-action">
                  <Link className="sw-btn sw-btn--outline" to={pageBodies.club.college.buttonTo}>
                    {pageBodies.club.college.buttonLabel}
                  </Link>
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="club-help-heading">
        <div className="wrap">
          <div className="sw-cta-band">
            <div>
              <h2 id="club-help-heading">{pageBodies.club.help.heading}</h2>
              <p>{pageBodies.club.help.description}</p>
            </div>
            <Link className="sw-btn" to={pageBodies.club.help.buttonTo}>
              {pageBodies.club.help.buttonLabel}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
