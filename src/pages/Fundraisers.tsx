import { AthleticHero } from "../components/AthleticHero"
import { PageMeta } from "../components/PageMeta"
import { fundraiserContact, fundraisers } from "../content/fundraisers"
import { club, pages } from "../content/site"
import {
  currentPublicFundraisers,
  fundraiserStatusLabel,
  fundraiserTiming,
} from "../lib/events/fundraiserTiming"

/** Decorative month/day tab built from the event's own `when` text. */
function DateTab({ when }: { when: string }) {
  const [month = "", day = ""] = (when.split(", ")[1] ?? "").split(" ")
  return (
    <span className="sw-fundraiser__date" aria-hidden="true">
      <span>{month.slice(0, 3)}</span>
      <strong>{day}</strong>
    </span>
  )
}

export function Fundraisers() {
  const now = new Date()
  const current = currentPublicFundraisers(fundraisers, now)
  const burgerville = current.find((event) => event.id === "burgerville")
  const others = current.filter((event) => event.id !== "burgerville")
  const burgervilleTiming = burgerville ? fundraiserTiming(burgerville.when, burgerville.time, now) : null

  return (
    <div className="sw-page sw-fundraisers">
      <PageMeta title={pages.fundraisers.title} description={pages.fundraisers.description} />

      <AthleticHero
        scene="fundraisers"
        eyebrow="Support the team"
        title="Fundraisers"
        subtitle={club.name}
        actions={
          <>
            {current.map((event) => (
              <a className="sw-btn" href={`#${event.id}`} key={event.id}>
                {event.business}
              </a>
            ))}
          </>
        }
        art={
          current.length > 0 ? (
            <div className="sw-flyer-fan" aria-hidden="true">
              {current.map((event) => (
                <img key={event.id} src={event.image} width={event.imageWidth} height={event.imageHeight} alt="" />
              ))}
            </div>
          ) : undefined
        }
      >
        <p>
          {burgerville
            ? "Burgerville is the current restaurant fundraiser for Albany High School Bowling. Share the official flyer with friends and relatives, and invite them to participate."
            : "No current restaurant fundraiser is posted."}
        </p>
      </AthleticHero>

      {burgerville && burgervilleTiming ? (
        <section className="section sw-fundraiser" id={burgerville.id} aria-labelledby="burgerville-heading">
          <div className="wrap fundraiser-layout">
            <div className="sw-panel sw-fundraiser__details">
              <div className="sw-fundraiser__ticket">
                <DateTab when={burgerville.when} />
                <div>
                  <h2 id="burgerville-heading">{burgerville.business}</h2>
                  <p className={`sw-status${burgervilleTiming === "past" ? " sw-status--past" : ""}`}>
                    {fundraiserStatusLabel(burgervilleTiming)}
                  </p>
                  <p className="fundraiser-when">{burgerville.when}</p>
                  <p className="fundraiser-time">{burgerville.time}</p>
                </div>
              </div>
              <p className="sw-fundraiser__terms">
                The flyer prints “Sunday, November 8th” and does not print a year. Sunday, November 8 is in 2026.
              </p>
              <div className="sw-fundraiser__facts">
                <div className="sw-fundraiser__fact">
                  <h3>Location</h3>
                  <p>
                    Burgerville
                    <br />
                    2310 Santiam Highway SE, Albany
                  </p>
                </div>
                <div className="sw-fundraiser__fact sw-fundraiser__fact--steps">
                  <h3>How to participate</h3>
                  <p>
                    Present this flyer or use code <span className="sw-code">BVGIVES</span> when ordering in the app. The
                    flyer says 20% of the purchase will be donated.
                  </p>
                </div>
              </div>
              <p className="sw-fundraiser__cta">
                <a className="sw-btn" href={burgerville.flyer}>
                  View the full flyer
                </a>
              </p>
              <div className="sw-fundraiser__volunteers">
                <h3>Volunteers</h3>
                <p>The club needs student bowlers and several parents to help promote the fundraiser. Volunteers can:</p>
                <ul className="plain-list">
                  <li>Help clean tables</li>
                  <li>Speak with customers outside about the fundraiser</li>
                  <li>Hold Albany High School Bowling posters</li>
                  <li>Wave to passing cars to promote the event</li>
                </ul>
                <p>The team also needs volunteers to make posters identifying Albany High School Bowling.</p>
                <p>
                  Families who can help should tell {fundraiserContact.name} what time they can attend and for how long,
                  so coverage can be coordinated throughout the event.
                </p>
                <p>
                  <a className="sw-btn sw-btn--outline sw-btn--plain" href={`mailto:${fundraiserContact.email}`}>
                    Email {fundraiserContact.email}
                  </a>
                </p>
              </div>
            </div>
            <figure className="fundraiser-flyer sw-fundraiser__poster">
              <img
                src={burgerville.image}
                width={burgerville.imageWidth}
                height={burgerville.imageHeight}
                alt="Burgerville community fundraiser flyer for Albany High School Bowling on Sunday, November 8, from 4:00 PM to 8:00 PM."
                loading="lazy"
              />
              <figcaption>
                Official Burgerville flyer. <a href={burgerville.flyer}>Open the full flyer</a>
              </figcaption>
            </figure>
          </div>
        </section>
      ) : null}

      {others.map((event) => {
        const timing = fundraiserTiming(event.when, event.time, now)
        return (
          <section className="section sw-fundraiser" id={event.id} aria-labelledby={`${event.id}-heading`} key={event.id}>
            <div className="wrap fundraiser-layout">
              <div className="sw-panel sw-fundraiser__details">
                <div className="sw-fundraiser__ticket">
                  <DateTab when={event.when} />
                  <div>
                    <h2 id={`${event.id}-heading`}>{event.business}</h2>
                    <p className="sw-status">{fundraiserStatusLabel(timing)}</p>
                    <p className="fundraiser-when">{event.when}</p>
                    <p className="fundraiser-time">{event.time}</p>
                  </div>
                </div>
                <p>{event.place}</p>
                <p className="sw-fundraiser__cta">
                  <a className="sw-btn" href={event.flyer}>
                    View the full flyer
                  </a>
                </p>
              </div>
              <figure className="fundraiser-flyer sw-fundraiser__poster">
                <img src={event.image} width={event.imageWidth} height={event.imageHeight} alt="" />
              </figure>
            </div>
          </section>
        )
      })}

      <section className="section" aria-labelledby="share-heading">
        <div className="wrap">
          <div className="sw-cta-band sw-fundraisers__share">
            <div>
              <h2 id="share-heading">Share the announcement</h2>
              {current.length > 0 ? (
                <p>
                  Families are encouraged to share the official flyer and invite friends and relatives to participate.
                  Use the flyer link above to open or download the artwork, then send that file.
                </p>
              ) : (
                <p>No current fundraiser flyer is posted.</p>
              )}
              <p>
                Questions can go to {fundraiserContact.name} at{" "}
                <a href={`mailto:${fundraiserContact.email}`}>{fundraiserContact.email}</a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
