import { Link } from "react-router-dom"
import { AthleticHero } from "../components/AthleticHero"
import { ExternalLinkIcon } from "../components/header/icons"
import { PageMeta } from "../components/PageMeta"
import {
  club,
  pages,
  sterlingVolunteerInvitationUrl,
  sterlingVolunteersInfoUrl,
  studentCapacityNotice,
} from "../content/site"

const volunteerOpportunities = [
  "Tournament and event assistance",
  "Fundraising and community events",
  "Equipment and event setup",
  "General club assistance",
  "Student transportation, subject to additional approval",
] as const

const transportationMayInclude = [
  "A valid driver’s license",
  "Proof of auto insurance",
  "A motor vehicle record (MVR) review, when required by the school or club",
  "Written authorization from club leadership and any applicable school or district procedures",
] as const

const screeningConfigured = Boolean(sterlingVolunteerInvitationUrl)
const screeningHref = sterlingVolunteerInvitationUrl ?? sterlingVolunteersInfoUrl
const screeningLabel = screeningConfigured
  ? "Start volunteer background check"
  : "Learn about background checks"

export function Volunteer() {
  return (
    <div className="sw-page sw-volunteer">
      <PageMeta title={pages.volunteer.title} description={pages.volunteer.description} />
      <AthleticHero
        scene="club"
        eyebrow="Support our athletes"
        title="Volunteer With Albany High School Bowling"
        subtitle={club.name}
        actions={
          <>
            <a className="sw-btn" href="#volunteer-background-checks">
              Background checks
            </a>
            <Link className="sw-btn sw-btn--ghost" to="/contact">
              Contact leadership
            </Link>
          </>
        }
      >
        <p>
          The Albany High School Bowling Club depends on the generosity of parents, families, and
          community members who help make our bowling program possible.
        </p>
        <p>{studentCapacityNotice}</p>
        <p>
          While our student roster is currently full, we welcome adults interested in supporting our
          existing athletes and club activities.
        </p>
      </AthleticHero>

      <section className="section" aria-labelledby="volunteer-ways-heading">
        <div className="wrap">
          <article className="card sw-volunteer__card">
            <h2 id="volunteer-ways-heading">Ways adults can help</h2>
            <p>
              Volunteer roles support the athletes already on the roster. Availability and approval
              depend on club needs and applicable school procedures.
            </p>
            <ul className="plain-list">
              {volunteerOpportunities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="sw-volunteer__actions">
              <Link className="sw-btn" to="/contact">
                Contact club leadership
              </Link>
            </p>
          </article>
        </div>
      </section>

      <section
        className="section"
        id="volunteer-background-checks"
        aria-labelledby="volunteer-background-heading"
      >
        <div className="wrap">
          <article className="card sw-volunteer__card">
            <h2 id="volunteer-background-heading">Volunteer Background Checks</h2>
            <p>
              Albany High School Bowling uses Sterling Volunteers as its preferred third-party
              background-screening provider for adult volunteers. Screening helps protect student
              athletes and supports safe club activities.
            </p>
            <p>
              This website does not collect sensitive personal information for background checks, and
              it does not process screening applications. Screening is handled through Sterling
              Volunteers and any school or club procedures that leadership confirms.
            </p>
            <p className="sw-volunteer__notice" role="note">
              Contact club leadership before you order a background check. Completing a screening
              does not mean you are automatically authorized to volunteer with the club.
            </p>
            {!screeningConfigured ? (
              <p>
                An organization-specific Sterling Volunteers invitation link has not been published
                here yet. Use the informational link below to learn about Sterling Volunteers, then
                email club leadership for current screening instructions.
              </p>
            ) : (
              <p>
                Use the club’s Sterling Volunteers invitation link only after leadership confirms you
                should begin screening for a volunteer role.
              </p>
            )}
            <p className="sw-volunteer__actions">
              <a
                className="sw-btn sw-btn--plain"
                href={screeningHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {screeningLabel}
                <ExternalLinkIcon />
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
              <Link className="sw-btn sw-btn--outline" to="/contact">
                Ask leadership first
              </Link>
            </p>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="volunteer-transport-heading">
        <div className="wrap">
          <article className="card sw-volunteer__card">
            <h2 id="volunteer-transport-heading">Help With Transportation</h2>
            <p>
              Helping with student transportation is separate from general volunteer screening.
              Adults interested in driving or otherwise supporting travel for athletes may need
              additional authorization beyond a standard volunteer background check.
            </p>
            <p>
              This site does not claim that a standard Sterling Volunteers package includes a motor
              vehicle record (MVR) review, and it does not claim that any transportation requirements
              are already satisfied.
            </p>
            <p>Requirements for transportation help may include:</p>
            <ul className="plain-list">
              {transportationMayInclude.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>
              Ask club leadership what is currently required before offering rides or arranging
              student transportation.
            </p>
            <p className="sw-volunteer__actions">
              <Link className="sw-btn" to="/contact">
                Contact Us
              </Link>
            </p>
          </article>
        </div>
      </section>
    </div>
  )
}
