import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { BowlerArtwork } from "../components/bowlers/BowlerArtwork"
import { UpcomingTournaments } from "../components/bowlers/UpcomingTournaments"
import { PageMeta } from "../components/PageMeta"
import { SeasonClosedNotice } from "../components/SeasonClosedNotice"
import { bowlerProfiles, pageBodies, pages } from "../content/site"
import { AHSB_LOGO, SCHOOLS, SCHOOL_IDS, type SchoolId } from "../lib/content/schoolLogos"
import { schoolLabel, visibleBowlerProfiles, type BowlerProfile } from "../lib/content/bowlerProfiles"

function cardDetails(profile: BowlerProfile) {
  return {
    school: schoolLabel(profile.school),
    years: profile.yearsBowling == null ? null : `${profile.yearsBowling} ${profile.yearsBowling === 1 ? "year" : "years"} bowling`,
    grade: profile.grade,
  }
}

export function MeetTheBowlers() {
  const copy = pageBodies.bowlers
  const publicProfiles = visibleBowlerProfiles(bowlerProfiles)
  const [query, setQuery] = useState("")
  const [school, setSchool] = useState<SchoolId | "all">("all")
  const [sort, setSort] = useState<"directory" | "name">("directory")
  const [grouped, setGrouped] = useState(false)

  const cards = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    let next = publicProfiles.filter((profile) => {
      if (school !== "all" && profile.school !== school) return false
      if (words.length === 0) return true
      const haystack = `${profile.displayName} ${schoolLabel(profile.school) ?? ""}`.toLowerCase()
      return words.every((word) => haystack.includes(word))
    })
    if (sort === "name") {
      next = next.slice().sort((a, b) => a.displayName.localeCompare(b.displayName))
    }
    return next
  }, [publicProfiles, query, school, sort])

  const groups = grouped
    ? [...SCHOOL_IDS.map((id) => ({ id, label: SCHOOLS[id].label, cards: cards.filter((profile) => profile.school === id) })), { id: "none", label: "School not selected", cards: cards.filter((profile) => profile.school === null) }].filter((group) => group.cards.length > 0)
    : [{ id: "all", label: "", cards }]

  return (
    <div className="meet-bowlers">
      <PageMeta title={pages.bowlers.title} description={pages.bowlers.description} />
      <header className="meet-hero">
        <img className="meet-hero__logo" src={AHSB_LOGO} alt="Albany High School Bowling" />
        <p className="meet-hero__eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
        <p className="meet-hero__privacy">{copy.privacy}</p>
        <SeasonClosedNotice showVolunteerCta={false} />
      </header>

      <section className="meet-directory" aria-label="Bowler directory">
        <form className="meet-filters" onSubmit={(event) => event.preventDefault()}>
          <label>
            Search bowlers
            <input value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <label>
            School
            <select value={school} onChange={(event) => setSchool(event.target.value as SchoolId | "all")}>
              <option value="all">All schools</option>
              {SCHOOL_IDS.map((id) => (
                <option key={id} value={id}>
                  {SCHOOLS[id].label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Sort
            <select value={sort} onChange={(event) => setSort(event.target.value as "directory" | "name")}>
              <option value="directory">Directory order</option>
              <option value="name">A to Z</option>
            </select>
          </label>
          <label className="meet-filters__check">
            <input type="checkbox" checked={grouped} onChange={(event) => setGrouped(event.target.checked)} />
            Group by school
          </label>
        </form>

        {cards.length === 0 ? <p className="meet-empty">{copy.empty}</p> : null}
        {groups.map((group) => (
          <div key={group.id}>
            {group.label ? <h2 className="meet-group">{group.label}</h2> : null}
            <ul className="meet-grid">
              {group.cards.map((profile) => {
                const details = cardDetails(profile)
                return (
                  <li key={profile.id}>
                    <article className="meet-card">
                      <Link to={`/meet-the-bowlers/${profile.id}`}>
                        <BowlerArtwork profile={profile} />
                        <h3>{profile.displayName}</h3>
                      </Link>
                      {details.school ? <p>{details.school}</p> : null}
                      {details.grade ? <p>{details.grade}</p> : null}
                      {details.years ? <p>{details.years}</p> : null}
                      {profile.introduction ? <p>{profile.introduction}</p> : null}
                      <Link className="meet-card__view" to={`/meet-the-bowlers/${profile.id}`}>
                        View profile
                      </Link>
                    </article>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </section>
      <UpcomingTournaments />
    </div>
  )
}
