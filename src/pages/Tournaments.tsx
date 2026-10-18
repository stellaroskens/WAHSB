import { Link } from "react-router-dom"
import { AddToCalendar } from "../components/AddToCalendar"
import { AthleticHero } from "../components/AthleticHero"
import { FaqAnswerBody } from "../components/FaqEmbed"
import { PinMark } from "../components/Marks"
import { PageMeta } from "../components/PageMeta"
import {
  arrival,
  attire,
  club,
  pages,
  practiceTournaments,
  tournamentEvents,
  venues,
  type Venue,
} from "../content/site"
import { faqCategories } from "../content/faq"
import { calendarFile, directionsUrl } from "../lib/calendar"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const confirmedEvents = tournamentEvents.filter((event) => event.confirmed)
const earlierEvents = tournamentEvents.filter((event) => !event.confirmed)
const tournamentFaqs = faqCategories.find((category) => category.id === "faq-etiquette")?.items ?? []

const spectatorGuidance = [
  {
    title: "Let coaches coach",
    text: "Please leave coaching and technical instructions to the team's coaches during competition.",
  },
  {
    title: "Quiet during approaches",
    text: "Please stay quiet while bowlers prepare for and deliver their shots.",
  },
  {
    title: "Cheer between shots",
    text: "Positive encouragement and cheering between shots are welcome.",
  },
  {
    title: "Keep phones off the lanes",
    text: "Do not use phones on the bowling lanes or approach areas.",
  },
] as const

function cityLine(address: string) {
  const parts = address.split(",").map((part) => part.trim())
  if (parts.length < 2) return address
  const city = parts[parts.length - 2]
  const state = parts[parts.length - 1]?.split(" ")[0]
  return state ? `${city}, ${state}` : city
}

function PracticeCard({
  event,
  venue,
}: {
  event: (typeof practiceTournaments)[number]
  venue: Venue
}) {
  const calendar =
    event.startTime && event.endTime ? calendarFile(event, venue) : null

  return (
    <article className="event-card" id={event.id}>
      <p className="event-card__date">
        <span className="event-card__month">{MONTHS[event.month - 1]}</span>
        <span className="event-card__day">{event.day}</span>
        <span className="event-card__year">{event.year ?? "Year not confirmed"}</span>
      </p>
      <div className="event-card__body">
        <p className="event-card__kind">{event.name}</p>
        <h2>{venue.name}</h2>
        <p className="event-card__place">{cityLine(venue.address)}</p>
        <p className="event-card__address">{venue.address}</p>
        {event.arrivalNote ? <p className="event-card__note">{event.arrivalNote}</p> : null}
        {calendar ? (
          <>
            {calendar.mode === "all-day" ? <p className="calendar-soon">Time to be confirmed.</p> : null}
            <AddToCalendar file={calendar} />
          </>
        ) : (
          <p className="calendar-soon">Calendar details coming soon</p>
        )}
        <a
          className="event-card__directions"
          href={directionsUrl(venue.name, venue.address)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Get directions
          <span className="visually-hidden"> (opens in a new tab)</span>
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  )
}

export function Tournaments() {
  return (
    <div className="sw-page sw-tournaments">
      <PageMeta title={pages.tournaments.title} description={pages.tournaments.description} />

      <AthleticHero
        scene="tournaments"
        headingId="season-heading"
        eyebrow="Season"
        title="Tournaments"
        subtitle={club.name}
        art={
          <nav className="sw-scoreboard" aria-label="Practice tournament dates">
            <p className="sw-scoreboard__label">
              <PinMark /> Practice tournaments
            </p>
            <ol>
              {practiceTournaments.map((event) => {
                const venue = venues.find((item) => item.id === event.venueId)
                return (
                  <li key={event.id}>
                    <a href={`#${event.id}`}>
                      <span className="sw-scoreboard__date">
                        <span>{MONTHS[event.month - 1]}</span>
                        <strong>{event.day}</strong>
                      </span>
                      <span className="sw-scoreboard__venue">{venue?.name}</span>
                    </a>
                  </li>
                )
              })}
            </ol>
          </nav>
        }
      >
        <p>These dates include the confirmed year. The start time is not confirmed yet.</p>
      </AthleticHero>

      <section className="section sw-tournaments__season" aria-labelledby="season-heading">
        <div className="wrap">
          <div className="season-list event-list">
            {practiceTournaments.map((event) => {
              const venue = venues.find((item) => item.id === event.venueId)
              if (!venue) return null
              return <PracticeCard key={event.id} event={event} venue={venue} />
            })}
          </div>

          {confirmedEvents.length > 0 ? (
            <>
              <h2 className="subhead">Confirmed events</h2>
              <div className="season-list event-list">
                {confirmedEvents.map((event) => (
                  <article className="event-card" key={event.id}>
                    <p className="event-card__date">
                      <span className="event-card__year">Date not confirmed</span>
                    </p>
                    <div className="event-card__body">
                      <p className="event-card__kind">Confirmed</p>
                      <h2>{event.name}</h2>
                      <p>{event.detail}</p>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : null}

          {earlierEvents.length > 0 ? (
            <>
              <h2 className="subhead">Events the club has scheduled before</h2>
              <p className="season-note">
                The previous club website described district tournaments from November through January,
                district finals at the end of January, and a state tournament at the end of February for
                teams that qualify. It also described teams of eight, with five bowling at a time, and 20
                Baker games at each tournament. That schedule is not confirmed for the current season.
              </p>
              <div className="season-list event-list">
                {earlierEvents.map((event) => (
                  <article className="event-card" key={event.id}>
                    <p className="event-card__date">
                      <span className="event-card__year">Date not confirmed</span>
                    </p>
                    <div className="event-card__body">
                      <p className="event-card__kind">Not confirmed</p>
                      <h2>{event.name}</h2>
                      <p>{event.detail}</p>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </section>

      <section className="section">
        <div className="wrap info-grid sw-tournaments__day">
          <article className="card">
            <h2>Arrival</h2>
            <p className="note">
              These times were published on the previous website. Confirm them with a coach before you
              travel.
            </p>
            <dl className="detail-list">
              {arrival.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
            <p>
              The previous site described 12 games, a lunch break, the remaining 8 games, and then a
              stepladder final.
            </p>
          </article>

          <article className="card">
            <h2>Attire</h2>
            <p className="note">
              This is the uniform guidance from the previous club website. Confirm it before a
              tournament.
            </p>
            <ul className="plain-list">
              {attire.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="section tournament-note" aria-labelledby="spectator-note-heading">
        <div className="wrap">
          <div className="sw-panel sw-tournaments__note">
            <h2 id="spectator-note-heading">A note to parents &amp; spectators</h2>
            <p>
              Bowling tournaments require concentration, patience, and teamwork. We love having
              families come support our bowlers, and your encouragement makes a difference!
            </p>
            <p>
              During practices and competitions, please allow our coaches to coach. Parents and
              spectators are asked to remain as quiet as possible while bowlers prepare for and
              deliver their shots.
            </p>
            <p>
              Please avoid calling out instructions, coaching from the sidelines, or discussing
              missed shots while a student is bowling.
            </p>
            <p>
              Positive encouragement is always welcome at appropriate times between shots. Our goal
              is to create a respectful, supportive environment where every bowler can focus, learn,
              and enjoy the game.
            </p>
            <div className="guide-grid">
              <article className="card">
                <h3>Let coaches coach</h3>
                <p>Coaches provide instruction and guidance. Please avoid sideline coaching.</p>
              </article>
              <article className="card">
                <h3>Quiet during shots</h3>
                <p>
                  Keep conversations and distractions to a minimum when bowlers are preparing and
                  bowling.
                </p>
              </article>
              <article className="card">
                <h3>Cheer positively</h3>
                <p>Celebrate effort, improvement, and good sportsmanship between shots.</p>
              </article>
              <article className="card">
                <h3>Respect everyone</h3>
                <p>
                  Show respect to athletes, coaches, tournament officials, bowling center staff, and
                  other families.
                </p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="section tournament-faq" aria-labelledby="tournament-faq-heading">
        <div className="wrap">
          <div className="sw-panel sw-faq-panel">
            <h2 id="tournament-faq-heading">TOURNAMENT ETIQUETTE &amp; FAQs</h2>
            <p className="tournament-faq__intro">
              Helpful guidance for bowlers, families, and spectators on tournament day.
            </p>

            <div className="tournament-faq__guide">
              <h3>Cheer them on. Let them focus.</h3>
              <ul>
                {spectatorGuidance.map((point) => (
                  <li key={point.title}>
                    <h4>{point.title}</h4>
                    <p>{point.text}</p>
                  </li>
                ))}
              </ul>
            </div>

            {tournamentFaqs.length > 0 ? (
              <div className="tournament-faq__items">
                {tournamentFaqs.map((item) => (
                  <details className="tournament-faq__item" key={item.question}>
                    <summary className="tournament-faq__question">
                      <span className="tournament-faq__question-text">{item.question}</span>
                    </summary>
                    <div className="tournament-faq__answer">
                      <FaqAnswerBody item={item} />
                    </div>
                  </details>
                ))}
              </div>
            ) : (
              <p className="tournament-faq__intro">Tournament questions are not listed here yet.</p>
            )}

            <p className="tournament-faq__links">
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
