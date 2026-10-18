import { AthleticHero } from "../components/AthleticHero"
import { PageMeta } from "../components/PageMeta"
import { fundraiserContact, fundraisers } from "../content/fundraisers"
import { club, pages } from "../content/site"

const panda = fundraisers[0]
const burgerville = fundraisers[1]

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
            <a className="sw-btn" href={`#${panda.id}`}>
              {panda.business}
            </a>
            <a className="sw-btn sw-btn--ghost" href={`#${burgerville.id}`}>
              {burgerville.business}
            </a>
          </>
        }
        art={
          <div className="sw-flyer-fan" aria-hidden="true">
            <img src={panda.image} width={panda.imageWidth} height={panda.imageHeight} alt="" />
            <img
              src={burgerville.image}
              width={burgerville.imageWidth}
              height={burgerville.imageHeight}
              alt=""
            />
          </div>
        }
      >
        <p>
          Two restaurant fundraisers are coming up for Albany High School Bowling.
          Share the official flyer for each event with friends and relatives, and
          invite them to participate.
        </p>
      </AthleticHero>

      <section className="section sw-fundraiser" id={panda.id} aria-labelledby="panda-heading">
        <div className="wrap fundraiser-layout">
          <div className="sw-panel sw-fundraiser__details">
            <div className="sw-fundraiser__ticket">
              <DateTab when={panda.when} />
              <div>
                <h2 id="panda-heading">{panda.business}</h2>
                <p className="fundraiser-when">{panda.when}</p>
                <p className="fundraiser-time">{panda.time}</p>
              </div>
            </div>
            <p>The fundraiser runs throughout the day at Panda Express in Albany.</p>
            <div className="sw-fundraiser__facts">
              <div className="sw-fundraiser__fact">
                <h3>Location</h3>
                <p>
                  Panda Express
                  <br />
                  1310 Geary Street
                  <br />
                  Albany, OR 97322
                </p>
                <p>
                  <a href="tel:+15417911087">(541) 791-1087</a>
                </p>
              </div>
              <div className="sw-fundraiser__fact sw-fundraiser__fact--steps">
                <h3>How to participate</h3>
                <p>The flyer says 20% of event sales will be donated.</p>
                <ul className="plain-list">
                  <li>Order ahead or on Friday, October 30, 2026.</li>
                  <li>
                    Online: order at PandaExpress.com or in the app and enter{" "}
                    <span className="sw-code">3868031</span> in the fundraiser code box.
                  </li>
                  <li>In person: bring the paper flyer or show it on your smartphone.</li>
                  <li>
                    Present the flyer or the code with the order. The flyer says flyers
                    may not be handed out inside the restaurant or in its parking lot.
                  </li>
                </ul>
              </div>
            </div>
            <p className="sw-fundraiser__terms">
              The flyer also states that Panda Express donates 20% of pre-tax
              purchases when the event reaches $100 in pre-tax sales. The full
              participation terms are printed on the flyer.
            </p>
            <p className="sw-fundraiser__cta">
              <a className="sw-btn" href={panda.flyer}>
                View the full flyer
              </a>
            </p>
          </div>
          <figure className="fundraiser-flyer sw-fundraiser__poster">
            <img
              src={panda.image}
              width={panda.imageWidth}
              height={panda.imageHeight}
              alt="Panda Express fundraiser flyer for Albany High School Bowling on Friday, October 30, 2026, from 9:30 AM to 10:00 PM."
            />
            <figcaption>
              Official Panda Express flyer.{" "}
              <a href={panda.flyer}>Open the full flyer</a>
            </figcaption>
          </figure>
        </div>
      </section>

      <section
        className="section sw-fundraiser sw-fundraiser--flip"
        id={burgerville.id}
        aria-labelledby="burgerville-heading"
      >
        <div className="wrap fundraiser-layout">
          <div className="sw-panel sw-fundraiser__details">
            <div className="sw-fundraiser__ticket">
              <DateTab when={burgerville.when} />
              <div>
                <h2 id="burgerville-heading">{burgerville.business}</h2>
                <p className="fundraiser-when">{burgerville.when}</p>
                <p className="fundraiser-time">{burgerville.time}</p>
              </div>
            </div>
            <p className="sw-fundraiser__terms">
              The flyer prints “Sunday, November 8th” and does not print a year.
              Sunday, November 8 is in 2026.
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
                  Present this flyer or use code <span className="sw-code">BVGIVES</span> when
                  ordering in the app. The flyer says 20% of the purchase will be donated.
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
              <p>
                The club needs student bowlers and several parents to help promote the
                fundraiser. Volunteers can:
              </p>
              <ul className="plain-list">
                <li>Help clean tables</li>
                <li>Speak with customers outside about the fundraiser</li>
                <li>Hold Albany High School Bowling posters</li>
                <li>Wave to passing cars to promote the event</li>
              </ul>
              <p>
                The team also needs volunteers to make posters identifying Albany High
                School Bowling.
              </p>
              <p>
                Families who can help should tell {fundraiserContact.name} what time
                they can attend and for how long, so coverage can be coordinated
                throughout the event.
              </p>
              <p>
                <a
                  className="sw-btn sw-btn--outline sw-btn--plain"
                  href={`mailto:${fundraiserContact.email}`}
                >
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
              Official Burgerville flyer.{" "}
              <a href={burgerville.flyer}>Open the full flyer</a>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="section" aria-labelledby="share-heading">
        <div className="wrap">
          <div className="sw-cta-band sw-fundraisers__share">
            <div>
              <h2 id="share-heading">Share the announcements</h2>
              <p>
                Families are encouraged to share each official flyer and invite friends
                and relatives to participate. Use the flyer links above to open or
                download the artwork, then send that file.
              </p>
              <p>
                Questions about either fundraiser, or a Burgerville volunteer time, can
                go to {fundraiserContact.name} at{" "}
                <a href={`mailto:${fundraiserContact.email}`}>{fundraiserContact.email}</a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
