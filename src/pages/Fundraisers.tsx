import { AthleticHero } from "../components/AthleticHero"
import { PageMeta } from "../components/PageMeta"
import { fundraiserContact, fundraisers } from "../content/fundraisers"
import { club, library, pages } from "../content/site"

function RichStep({ text, code }: { text: string; code: string }) {
  if (!code || !text.includes(code)) return <li>{text}</li>
  const [before, after] = text.split(code)
  return (
    <li>
      {before}
      <span className="sw-code">{code}</span>
      {after}
    </li>
  )
}

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
        <p>{library.fundraisers.hero}</p>
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
            <p>{library.fundraisers.panda.intro}</p>
            <div className="sw-fundraiser__facts">
              <div className="sw-fundraiser__fact">
                <h3>Location</h3>
                <p>
                  {library.fundraisers.panda.placeName}
                  <br />
                  {library.fundraisers.panda.street}
                  <br />
                  {library.fundraisers.panda.locality}
                </p>
                <p>
                  <a href={library.fundraisers.panda.phoneHref}>{library.fundraisers.panda.phone}</a>
                </p>
              </div>
              <div className="sw-fundraiser__fact sw-fundraiser__fact--steps">
                <h3>How to participate</h3>
                <p>{library.fundraisers.panda.stepsIntro}</p>
                <ul className="plain-list">
                  {library.fundraisers.panda.steps.map((step) => (
                    <RichStep key={step} text={step} code={library.fundraisers.panda.code} />
                  ))}
                </ul>
              </div>
            </div>
            <p className="sw-fundraiser__terms">{library.fundraisers.panda.terms}</p>
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
              alt={library.fundraisers.panda.flyerAlt}
            />
            <figcaption>
              {library.fundraisers.panda.caption}{" "}
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
            <p className="sw-fundraiser__terms">{library.fundraisers.burgerville.yearNote}</p>
            <div className="sw-fundraiser__facts">
              <div className="sw-fundraiser__fact">
                <h3>Location</h3>
                <p>
                  {library.fundraisers.burgerville.placeName}
                  <br />
                  {library.fundraisers.burgerville.street}
                </p>
              </div>
              <div className="sw-fundraiser__fact sw-fundraiser__fact--steps">
                <h3>How to participate</h3>
                <p>
                  {library.fundraisers.burgerville.steps.includes(library.fundraisers.burgerville.code) ? (
                    <>
                      {library.fundraisers.burgerville.steps.split(library.fundraisers.burgerville.code)[0]}
                      <span className="sw-code">{library.fundraisers.burgerville.code}</span>
                      {library.fundraisers.burgerville.steps.split(library.fundraisers.burgerville.code)[1]}
                    </>
                  ) : (
                    library.fundraisers.burgerville.steps
                  )}
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
              <p>{library.fundraisers.burgerville.volunteerIntro}</p>
              <ul className="plain-list">
                {library.fundraisers.burgerville.volunteerItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p>{library.fundraisers.burgerville.volunteerPosters}</p>
              <p>
                {library.fundraisers.burgerville.volunteerAsk.replace("the fundraiser contact", fundraiserContact.name)}
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
              alt={library.fundraisers.burgerville.flyerAlt}
              loading="lazy"
            />
            <figcaption>
              {library.fundraisers.burgerville.caption}{" "}
              <a href={burgerville.flyer}>Open the full flyer</a>
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="section" aria-labelledby="share-heading">
        <div className="wrap">
          <div className="sw-cta-band sw-fundraisers__share">
            <div>
              <h2 id="share-heading">{library.fundraisers.shareHeading}</h2>
              <p>{library.fundraisers.shareBody}</p>
              <p>
                {library.fundraisers.shareQuestions} {fundraiserContact.name} at{" "}
                <a href={`mailto:${fundraiserContact.email}`}>{fundraiserContact.email}</a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
