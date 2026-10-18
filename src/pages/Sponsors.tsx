import { type MouseEvent } from "react"
import { AthleticHero } from "../components/AthleticHero"
import { PageMeta } from "../components/PageMeta"
import { SponsorInquiry } from "../components/SponsorInquiry"
import { FundraiserShare } from "../components/FundraiserShare"
import { PaymentOptions } from "../components/PaymentOptions"
import { WaysToContribute } from "../components/WaysToContribute"
import { businessSponsors, pages, practiceLocation } from "../content/site"

const publicSponsors = businessSponsors.filter((sponsor) => sponsor.approved === true)

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
  return (
    <div className="sw-page sw-sponsors">
      <PageMeta title={pages.sponsors.title} description={pages.sponsors.description} />
      <AthleticHero
        scene="sponsors"
        headingId="sponsor-options-heading"
        title="Support"
        subtitle="Albany High School Bowling"
      >
        <p>
          There are two ways to help: support the club, or sponsor a bowler. Every
          contribution helps create opportunities for local students to learn, grow,
          and compete. You can support the entire Albany High School Bowling club or
          direct your support toward a specific bowler. The coaches confirm what
          that support includes. This website does not take payment, and a gift
          listed here is not described as tax deductible.
        </p>
      </AthleticHero>

      <section className="section sponsor-options" aria-labelledby="sponsor-options-heading">
        <div className="wrap">
          <div className="sw-sponsors__options">
            <article className="sw-panel sw-sponsors__option">
              <span className="sw-icon-disc">
                <TeamIcon />
              </span>
              <div>
                <h2>Sponsor the team</h2>
                <p>Support Albany High School Bowling as a whole.</p>
                <a className="sw-btn" href="#sponsor-inquiry" onClick={openAnchor}>
                  Support the team
                </a>
              </div>
            </article>
            <article className="sw-panel sw-sponsors__option">
              <span className="sw-icon-disc sw-icon-disc--navy">
                <BowlerIcon />
              </span>
              <div>
                <h2>Sponsor a bowler</h2>
                <p>Choose a bowler to direct your support toward.</p>
                <a className="sw-btn" href="#bowler-lookup" onClick={openAnchor}>
                  Find a bowler
                </a>
              </div>
            </article>
          </div>

          <div className="sw-sponsors__grid">
            <div className="sw-panel sw-sponsors__form">
              <h2 id="sponsor-form-heading">Sponsorship form</h2>
              <SponsorInquiry />
            </div>

            <div className="sw-sponsors__side">
              <section className="sw-panel sponsor-recognition" aria-labelledby="recognition-heading">
                <div className="sponsor-recognition__intro">
                  <h2 id="recognition-heading">Sponsor recognition</h2>
                  <p>
                    Choose how you&apos;d like your support to be recognized. Recognition is
                    private by default, and public recognition requires permission and
                    approval.
                  </p>
                  <p>
                    A contribution is not recognized until it is received, the sponsor
                    choices are verified, and the club approves. An email draft is not a
                    verified contribution.
                  </p>
                </div>
                <div className="sponsor-recognition__cards">
                  <article className="sponsor-recognition__card sponsor-recognition__card--private">
                    <h3>Keep your support private</h3>
                    <p>Your contribution can remain private. Public recognition is optional.</p>
                    <p className="sponsor-recognition__label">Private by default</p>
                    <p>
                      Private sponsors are not added to public sponsor lists, the homepage,
                      or shirt printing.
                    </p>
                  </article>
                  <article className="sponsor-recognition__card">
                    <h3>Next-season T-shirt recognition</h3>
                    <p className="sponsor-recognition__amount">More than $150</p>
                    <p>
                      Verified contributions greater than $150 may qualify for sponsor-name
                      recognition on next season&apos;s team T-shirt, subject to sponsor
                      consent and print approval.
                    </p>
                    <ul className="plain-list">
                      <li>The financial contribution must be received and verified.</li>
                      <li>The amount must be more than $150. An exact $150 contribution does not qualify.</li>
                      <li>The sponsor must choose public recognition and explicitly consent to shirt printing.</li>
                      <li>The club must approve the name.</li>
                      <li>Printing applies to the next season, not the current season.</li>
                      <li>Placement, production deadlines, printing capacity, and final artwork require club approval.</li>
                      <li>Private sponsors are excluded.</li>
                      <li>Recognition is not guaranteed.</li>
                    </ul>
                    <p className="sponsor-recognition__fine">
                      T-shirt recognition applies to next season only, for verified
                      financial sponsorships over $150, subject to club approval and
                      printing deadlines. It does not include a free shirt, and it does
                      not change the Albany High School Bowling shirt logo.
                    </p>
                  </article>
                  <article className="sponsor-recognition__card">
                    <h3>Homepage sponsor recognition</h3>
                    <p className="sponsor-recognition__amount">More than $200</p>
                    <p>
                      Verified contributions greater than $200 may qualify for sponsor-name
                      or logo recognition on the website homepage, subject to permission
                      and approval.
                    </p>
                    <ul className="plain-list">
                      <li>The received contribution must be more than $200. An exact $200 contribution does not qualify.</li>
                      <li>Public recognition must be selected.</li>
                      <li>Separate permission to publish the name or logo must be granted.</li>
                      <li>A logo must be reviewed and approved before use.</li>
                      <li>The club must approve the listing.</li>
                      <li>No sponsor name or logo is published automatically.</li>
                    </ul>
                    <p className="sponsor-recognition__fine">
                      Amounts and contact details are not shown publicly. A sponsor who
                      contributes more than $200 may qualify for both the shirt and the
                      homepage if every condition is met.
                    </p>
                  </article>
                </div>
                <p className="sponsor-recognition__note">
                  In-kind community supporters may receive separately approved recognition.
                  That recognition does not depend on assigning a dollar amount.
                </p>
              </section>
            </div>
          </div>

          <section className="sw-panel sponsor-contribute" aria-labelledby="ways-to-contribute-heading">
            <WaysToContribute preview="sponsorship" />
            <div className="connect-block connect-block--nested">
              <h2 id="support-payment-heading">Choose how to support our bowlers</h2>
              <p>
                Payment options will become available after the club completes setup and
                approval.
              </p>
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
                src={practiceLocation.logoSrc}
                width={practiceLocation.logoWidth}
                height={practiceLocation.logoHeight}
                alt="Lakeshore Lanes logo"
                loading="lazy"
              />
            </div>
            <div className="community-lakeshore__copy">
              <p className="community-lakeshore__eyebrow">Community supporter</p>
              <h2 id="community-lakeshore-heading">Thank you, Lakeshore Lanes</h2>
              <p>
                Albany High School Bowling appreciates Lakeshore Lanes for supporting
                our bowlers through lane access and practice time. Community support
                helps give student athletes a place to develop their skills and grow
                as a team.
              </p>
              <h3>Lakeshore Lanes</h3>
              <p>
                {practiceLocation.street}
                <br />
                {practiceLocation.locality}
              </p>
              <p>
                <a href={practiceLocation.phoneHref}>{practiceLocation.phone}</a>
              </p>
              <p>Lane access and practice time for Albany High School Bowling.</p>
              <div className="community-lakeshore__actions">
                <a
                  className="sw-btn sw-btn--outline sw-btn--plain"
                  href={lakeshoreDirections}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get directions
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
                <a
                  className="sw-btn sw-btn--outline sw-btn--plain"
                  href={practiceLocation.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit website
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
                <a className="sw-btn sw-btn--outline sw-btn--plain" href={practiceLocation.phoneHref}>
                  Call Lakeshore Lanes
                </a>
              </div>
            </div>
          </article>

          <div className="sw-panel community-sponsor-grid" aria-labelledby="community-sponsor-grid-heading" role="region">
            <div className="community-sponsor-grid__intro">
              <h2 id="community-sponsor-grid-heading">Our community supporters</h2>
              <p>
                We&apos;re grateful to the local businesses and community members who help
                support Albany High School Bowling.
              </p>
            </div>
            {publicSponsors.length === 0 ? (
              <div className="community-sponsor-grid__empty">
                <h3>Interested in supporting our bowlers?</h3>
                <p>
                  Local businesses and community members are welcome to learn about
                  sponsorship opportunities.
                </p>
                <a className="sw-btn community-sponsor-grid__action" href="#sponsor-options-heading">
                  Learn about sponsorship
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
