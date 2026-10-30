import { Link } from "react-router-dom"
import { PageMeta } from "../../components/PageMeta"
import { practiceTournaments, venues } from "../../content/site"
import { calendarFile } from "../../lib/calendar"

export function AdminTournaments() {
  return (
    <div className="admin-page">
      <PageMeta
        title="Tournament Management | Albany High School Bowling"
        description="Venue and calendar verification for Albany High School Bowling."
      />
      <div className="admin-page__intro">
        <h2>Tournament management</h2>
        <p>
          Read-only check of venues and calendar files. Edit the dates in{" "}
          <Link to="/admin/content?page=tournaments">Practices and Tournaments</Link>. Start times stay empty until
          the club confirms them.
        </p>
      </div>

      <h3 className="admin-subheading">Venues ({venues.length})</h3>
      <ul className="admin-section-list">
        {venues.map((venue) => (
          <li key={venue.id} className="admin-section-list__item">
            <div>
              <h3>{venue.name}</h3>
              <p>
                {venue.address} · {venue.phone}
              </p>
            </div>
            <span className="admin-badge">Verified record</span>
          </li>
        ))}
      </ul>

      <h3 className="admin-subheading">Practice tournaments & calendar</h3>
      <ul className="admin-section-list">
        {practiceTournaments.map((event) => {
          const venue = venues.find((item) => item.id === event.venueId)
          const calendar = venue ? calendarFile(event, venue) : null
          const timed = Boolean(event.startTime && event.endTime)
          return (
            <li key={event.id} className="admin-section-list__item">
              <div>
                <h3>
                  {event.name} · {event.month}/{event.day}/{event.year}
                </h3>
                <p>
                  Venue: {venue?.name ?? "MISSING"} · Calendar:{" "}
                  {calendar ? (timed ? "Google + Outlook + ICS ready" : "All-day ICS/Google only (times TBD)") : "Unavailable"}
                </p>
              </div>
              <span className="admin-badge">{venue ? "OK" : "Broken"}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
