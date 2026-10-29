import { Link } from "react-router-dom"
import { AthleticHero } from "../components/AthleticHero"
import { EmptyState } from "../components/EmptyState"
import { FaqAnswerBody } from "../components/FaqEmbed"
import { PinMark } from "../components/Marks"
import { PageMeta } from "../components/PageMeta"
import { faqCategories } from "../content/faq"
import { club, pages, practiceLocation, studentCapacityNotice } from "../content/site"

const practiceFaqIds = ["faq-practices", "faq-equipment", "faq-basics"] as const

const practiceFaqCategories = practiceFaqIds.flatMap((id) => {
  const category = faqCategories.find((entry) => entry.id === id)
  return category ? [category] : []
})

export function Practices() {
  return (
    <div className="sw-page sw-practices">
      <PageMeta title={pages.practices.title} description={pages.practices.description} />
      <AthleticHero
        scene="practices"
        eyebrow="On the lanes"
        title="Practices"
        subtitle={club.name}
        actions={
          <>
            <a className="sw-btn" href="#practice-location">
              {practiceLocation.name}
            </a>
            <a className="sw-btn sw-btn--ghost" href="#practice-faq-heading">
              PRACTICE FAQs
            </a>
          </>
        }
      >
        <p>
          Practices are where bowlers learn the game, get comfortable with the
          approach, and get ready to compete as a team.
        </p>
      </AthleticHero>

      <section className="section">
        <div className="wrap sw-practices__grid">
          <article className="card sw-practices__location" id="practice-location">
            <div className="sw-practices__location-copy">
              <h2>
                <PinMark /> Location
              </h2>
              <p className="place-name">{practiceLocation.name}</p>
              <p className="sw-practices__address">
                {practiceLocation.street}
                <br />
                {practiceLocation.locality}
              </p>
              <p>{practiceLocation.detail}</p>
              <p>
                <a className="sw-practices__phone" href={practiceLocation.phoneHref}>
                  {practiceLocation.phone}
                </a>
              </p>
              <p className="practice-location__actions">
                <a
                  className="sw-btn sw-btn--plain"
                  href={practiceLocation.directions}
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
                  Call {practiceLocation.name}
                </a>
              </p>
            </div>
            <div className="sw-practices__logo">
              <img
                src={practiceLocation.logoSrc}
                width={practiceLocation.logoWidth}
                height={practiceLocation.logoHeight}
                alt="Lakeshore Lanes logo"
                loading="lazy"
              />
            </div>
          </article>

          <article className="card sw-practices__schedule">
            <h2>Schedule</h2>
            <EmptyState title="Days and times are not posted yet">
              The current club site says practice information is coming soon. No
              dates or start times are confirmed here.
            </EmptyState>
          </article>

          <article className="card">
            <h2>What to bring</h2>
            <ul className="plain-list">
              <li>Clothes you can move in.</li>
              <li>Questions. Coaches would rather explain the game than have you guess.</li>
            </ul>
            <p>
              Fees, jerseys, and equipment expectations are not confirmed on this
              site. Ask a coach before you buy shoes or a ball.
            </p>
          </article>

          <article className="card">
            <h2>Student participation</h2>
            <p>{studentCapacityNotice}</p>
            <p>
              Coaches teach the game at practice for athletes already on the roster, including
              approach, scoring, and how a team bowls together.
            </p>
            <p>
              Adults interested in supporting practices, events, or transportation can learn about
              volunteer opportunities and screening requirements.
            </p>
            <p>
              <Link className="sw-btn" to="/volunteer">
                Volunteer Opportunities
              </Link>
            </p>
          </article>
        </div>
      </section>

      <section className="section practice-faq" aria-labelledby="practice-faq-heading">
        <div className="wrap">
          <div className="sw-panel sw-faq-panel">
            <h2 id="practice-faq-heading">PRACTICE FAQs</h2>
            <p className="practice-faq__intro">
              Find answers to common questions about practices, equipment, participation, and
              volunteering.
            </p>

            {practiceFaqCategories.map((category) => (
              <div className="practice-faq__category" key={category.id}>
                <h3>{category.title}</h3>
                {category.intro ? <p className="practice-faq__category-intro">{category.intro}</p> : null}
                <div className="practice-faq__items">
                  {category.items.map((item) => (
                    <details className="practice-faq__item" key={item.question}>
                      <summary className="practice-faq__question">
                        <span className="practice-faq__question-text">{item.question}</span>
                      </summary>
                      <div className="practice-faq__answer">
                        <FaqAnswerBody item={item} />
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}

            <p className="practice-faq__links">
              <Link to="/faq">
                View all FAQs <span aria-hidden="true">→</span>
              </Link>
              <Link to="/faq#faq-ask">
                Ask a question <span aria-hidden="true">→</span>
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
