import { Link, useParams } from "react-router-dom"
import { BowlerArtwork } from "../components/bowlers/BowlerArtwork"
import { UpcomingTournaments } from "../components/bowlers/UpcomingTournaments"
import { PageMeta } from "../components/PageMeta"
import { bowlerHonors, bowlerProfiles, bowlerResults } from "../content/site"
import {
  bowlingAverage,
  countPercents,
  formatPercent,
  formatStat,
  publishedResultsFor,
  summaryFromResults,
} from "../lib/content/bowlerStats"
import { bowlerById, bowlerStatusLabel, isPublicBowler, schoolLabel } from "../lib/content/bowlerProfiles"

export function BowlerProfilePage() {
  const { playerId = "" } = useParams()
  const profile = bowlerById(bowlerProfiles, playerId)
  if (!profile || !isPublicBowler(profile)) {
    return (
      <div className="meet-bowlers">
        <PageMeta title="Bowler profile | AHSB" description="That bowler profile is not on the public AHSB site." />
        <p className="meet-missing">
          This bowler profile is not on the public site. <Link to="/meet-the-bowlers">Back to Meet the Bowlers</Link>
        </p>
      </div>
    )
  }

  const school = schoolLabel(profile.school)
  const results = publishedResultsFor(bowlerResults, profile.id)
  const summary = summaryFromResults(results)
  const honors = bowlerHonors.filter((honor) => honor.profileId === profile.id && honor.status === "published")

  return (
    <div className="meet-bowlers">
      <PageMeta
        title={`${profile.displayName} | Meet the Bowlers | AHSB`}
        description={`${profile.displayName} on the AHSB Meet the Bowlers page.`}
      />
      <p className="meet-back">
        <Link to="/meet-the-bowlers">Back to Meet the Bowlers</Link>
      </p>
      <header className="meet-profile">
        <BowlerArtwork profile={profile} frame="profile" />
        <div>
          <p className="meet-hero__eyebrow">AHSB</p>
          <h1>{profile.displayName}</h1>
          {school ? <p className="meet-profile__school">{school}</p> : null}
          <ul className="meet-facts">
            {profile.grade ? <li>Grade {profile.grade}</li> : null}
            {profile.age != null ? <li>Age {profile.age}</li> : null}
            {profile.yearsBowling != null ? <li>{profile.yearsBowling} years bowling</li> : null}
            <li>{profile.placeholder ? "Placeholder card" : bowlerStatusLabel(profile)}</li>
          </ul>
          {profile.introduction ? <p>{profile.introduction}</p> : null}
          {profile.placeholder ? null : (
            <p className="meet-note">This card does not show a family-approval badge. Guardian approval is not recorded here.</p>
          )}
        </div>
      </header>

      <section className="meet-summary" aria-label="Statistics summary">
        <h2>Season snapshot</h2>
        <ul>
          <li>
            <span>Tournaments attended</span>
            <strong>{results.length === 0 ? "No records entered" : summary.tournaments}</strong>
          </li>
          <li>
            <span>Games bowled</span>
            <strong>{formatStat(summary.games)}</strong>
          </li>
          <li>
            <span>Average</span>
            <strong>{summary.average == null ? "Not entered" : summary.average.toFixed(1)}</strong>
          </li>
          <li>
            <span>High game</span>
            <strong>{formatStat(summary.highGame)}</strong>
          </li>
          <li>
            <span>High series</span>
            <strong>{formatStat(summary.highSeries)}</strong>
          </li>
          <li>
            <span>Honors earned</span>
            <strong>{honors.length === 0 ? "No records entered" : honors.length}</strong>
          </li>
        </ul>
      </section>

      <section className="meet-table-wrap" aria-labelledby="attended-heading">
        <h2 id="attended-heading">Attended tournaments</h2>
        {results.length === 0 ? (
          <p>No records entered.</p>
        ) : (
          <div className="meet-table-scroll">
            <table className="meet-table">
              <thead>
                <tr>
                  {[
                    "Tournament",
                    "Date",
                    "School",
                    "Bowler",
                    "Bowling center",
                    "Games played",
                    "Strikes",
                    "Spares",
                    "Opens",
                    "Total",
                    "Fill %",
                    "Strike %",
                    "Participation %",
                    "Average",
                    "High game",
                    "High series",
                    "Notes",
                  ].map((heading) => (
                    <th key={heading} scope="col">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((result) => {
                  const percents = countPercents(result)
                  const average = bowlingAverage(result)
                  return (
                    <tr key={result.id}>
                      <td>{result.tournamentName}</td>
                      <td>{result.date ?? "Not entered"}</td>
                      <td>{schoolLabel(result.school) ?? "Not entered"}</td>
                      <td>{profile.displayName}</td>
                      <td>{result.bowlingCenter ?? "Not entered"}</td>
                      <td>{formatStat(result.gamesPlayed)}</td>
                      <td>{formatStat(result.strikes)}</td>
                      <td>{formatStat(result.spares)}</td>
                      <td>{formatStat(result.opens)}</td>
                      <td>{formatStat(result.total)}</td>
                      <td>{formatPercent(percents?.fillPct ?? null)}</td>
                      <td>{formatPercent(percents?.strikePct ?? null)}</td>
                      <td>Not calculated</td>
                      <td>{average == null ? "Not entered" : average.toFixed(1)}</td>
                      <td>{formatStat(result.highGame)}</td>
                      <td>{formatStat(result.highSeries)}</td>
                      <td>{result.notes ?? ""}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="meet-note">
          Strike and fill percentages use entered strike, spare, and open counts. Participation percentage is not
          calculated because possible games are not stored. Blank cells were not entered.
        </p>
      </section>

      <UpcomingTournaments />

      <section aria-labelledby="honors-heading">
        <h2 id="honors-heading">Honors and milestones</h2>
        {honors.length === 0 ? (
          <p>No achievements have been added yet.</p>
        ) : (
          <ol className="meet-honors">
            {honors.map((honor) => (
              <li key={honor.id}>
                <strong>{honor.title}</strong>
                {honor.date ? <span> {honor.date}</span> : null}
                {honor.detail ? <p>{honor.detail}</p> : null}
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}
