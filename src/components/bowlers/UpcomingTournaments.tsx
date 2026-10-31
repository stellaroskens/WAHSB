import { Link } from "react-router-dom"
import { AddToCalendar } from "../AddToCalendar"
import { practiceTournaments, venues } from "../../content/site"
import { calendarFile, directionsUrl } from "../../lib/calendar"
import { eventIsUpcoming } from "../../lib/content/bowlerStats"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function UpcomingTournaments() {
  const today = new Date()
  const events = practiceTournaments.filter((event) => eventIsUpcoming(event, today))

  return (
    <section className="meet-upcoming" aria-labelledby="upcoming-tournaments-heading">
      <div className="meet-upcoming__head">
        <p>Upcoming tournaments</p>
        <h2 id="upcoming-tournaments-heading">On the club schedule</h2>
      </div>
      {events.length === 0 ? (
        <p>No upcoming tournaments are on the schedule.</p>
      ) : (
        <ul className="meet-upcoming__list">
          {events.map((event) => {
            const venue = venues.find((item) => item.id === event.venueId)
            const calendar = venue && event.startTime && event.endTime ? calendarFile(event, venue) : null
            return (
              <li key={event.id}>
                <p className="meet-upcoming__date">
                  <span>{MONTHS[event.month - 1]}</span>
                  <strong>{event.day}</strong>
                  <span>{event.year ?? "Year not confirmed"}</span>
                </p>
                <div>
                  <h3>{event.name}</h3>
                  <p>{venue ? venue.name : "Bowling center is not on the venue list."}</p>
                  {venue ? <p>{venue.address}</p> : null}
                  <p>{event.startTime && event.endTime ? `${event.startTime}–${event.endTime}` : "Time is not confirmed."}</p>
                  <p>
                    <Link to={`/tournaments#${event.id}`}>Tournament details</Link>
                    {venue ? (
                      <>
                        {" · "}
                        <a href={directionsUrl(venue.name, venue.address)} target="_blank" rel="noreferrer">
                          Directions
                        </a>
                      </>
                    ) : null}
                  </p>
                  {calendar ? <AddToCalendar file={calendar} /> : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
