import { Link } from "react-router-dom"
import { AthleticHero, SectionHeading } from "../components/AthleticHero"
import { PageMeta } from "../components/PageMeta"
import { coachPortraits, websiteLogo } from "../content/media"
import { bakerFrames, club, coaches, pages } from "../content/site"

const collegeLinks = [
  { href: "https://bowl.com/youth/high-school", label: "USBC High School Bowling" },
  { href: "https://bowl.com/youth/collegiate", label: "USBC Collegiate Bowling" },
  { href: "https://smart.bowl.com/", label: "SMART Scholarship Information" },
] as const

export function OurClub() {
  return (
    <div className="sw-page sw-club">
      <PageMeta title={pages.club.title} description={pages.club.description} />
      <AthleticHero
        scene="club"
        title="Our Club"
        subtitle={club.name}
        actions={
          <>
            <a className="sw-btn" href="#coaches">
              Our Coaches
            </a>
            <Link className="sw-btn sw-btn--ghost" to="/contact">
              Ask about joining
            </Link>
          </>
        }
        art={
          <div className="sw-logo-badge">
            <img
              src={websiteLogo.src}
              srcSet={websiteLogo.srcSet}
              sizes="(max-width: 900px) 70vw, 352px"
              width={websiteLogo.width}
              height={websiteLogo.height}
              alt="Albany High School Bowling logo"
            />
          </div>
        }
      >
        <p>
          Albany High School Bowling teaches the game and makes room for students
          to grow into it. The aim is skill, confidence, teamwork, and
          sportsmanship.
        </p>
      </AthleticHero>

      <section className="section sw-club__coaches" id="coaches" aria-labelledby="coaches-heading">
        <div className="wrap">
          <SectionHeading id="coaches-heading" title="Our Coaches">
            <p>Biographies below are summarized from the club’s current website.</p>
          </SectionHeading>
          <div className="sw-club__coach-grid">
            {coaches.map((coach) => (
              <article className="sw-coach" key={coach.id}>
                <div className="sw-coach__head">
                  <img
                    className="sw-coach__photo"
                    src={coachPortraits[coach.id].src}
                    srcSet={coachPortraits[coach.id].srcSet}
                    sizes="(max-width: 700px) 40vw, 220px"
                    width={1254}
                    height={1254}
                    alt={coach.name}
                    loading="lazy"
                  />
                  <div className="sw-coach__id">
                    <p className="sw-chip sw-chip--red">{coach.role}</p>
                    <h3>{coach.name}</h3>
                  </div>
                </div>
                <p className="sw-coach__bio">{coach.summary}</p>
              </article>
            ))}
          </div>
          <article className="sw-coach sw-coach--admin">
            <span className="sw-icon-disc sw-icon-disc--navy" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zm0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5z" />
              </svg>
            </span>
            <div className="sw-coach__id">
              <p className="sw-chip">Club Administrator</p>
              <h3>Maranda Fisher</h3>
            </div>
          </article>
        </div>
      </section>

      <section className="section" aria-label="About the club">
        <div className="wrap sw-club__info-grid">
          <article className="card club-info sw-club__info" aria-labelledby="team-sport-heading">
            <h2 id="team-sport-heading">A team sport</h2>
            <p>
              Practices build individual form, and tournaments turn that work into
              a shared score. The club uses Baker format, where five bowlers
              complete one game together. You do not have to carry every frame by
              yourself.
            </p>
            <ul className="plain-list">
              <li>Bowling is both an individual skill and a team sport.</li>
              <li>During practices, students develop their approach, release, accuracy, and consistency.</li>
              <li>In Baker format, five bowlers share a single ten-frame game.</li>
              <li>
                In a standard five-bowler Baker lineup, bowlers take assigned frames, commonly 1 and 6,
                2 and 7, 3 and 8, 4 and 9, and 5 and 10.
              </li>
              <li>Team members contribute to one combined score.</li>
              <li>Encouragement, cooperation, focus, and sportsmanship are important.</li>
            </ul>
            <ol className="sw-baker" aria-label="Standard five-bowler Baker lineup">
              {bakerFrames.map((row) => (
                <li key={row.bowler}>
                  <span className="sw-baker__bowler">{row.bowler}</span>
                  <span className="sw-baker__frames">{row.frames}</span>
                </li>
              ))}
            </ol>
            <p>Coaches determine the actual competition lineups and procedures.</p>
            <p className="club-action">
              <Link className="sw-btn" to="/contact">
                Questions about team bowling?
              </Link>
            </p>
          </article>

          <article className="card club-info sw-club__info" aria-labelledby="beginners-heading">
            <h2 id="beginners-heading">Beginners are welcome</h2>
            <p>You do not need tournament experience to join. Coaches teach bowlers who are new and bowlers who already compete.</p>
            <p>
              The club is meant to be a good experience for athletes who want to
              chase scores and for those who show up because they like the game.
            </p>
            <ul className="plain-list">
              <li>Students with different bowling experience levels can learn and develop skills.</li>
              <li>Coaches help introduce the basics of bowling.</li>
              <li>Beginners can work on their approach, aiming, balance, release, and understanding scoring.</li>
              <li>Bowling provides opportunities to build confidence, friendships, patience, and teamwork.</li>
              <li>Students do not need to arrive with tournament experience.</li>
              <li>
                Families should contact the coaches about current participation requirements, equipment,
                and practice arrangements.
              </li>
            </ul>
            <p className="club-action">
              <Link className="sw-btn" to="/contact">
                Ask about joining
              </Link>
            </p>
          </article>

          <article className="card club-info sw-club__info sw-club__info--wide" aria-labelledby="college-heading">
            <div className="sw-club__college">
              <div>
                <h2 id="college-heading">College bowling opportunities</h2>
                <p>
                  Some athletes continue on to college bowling. Ask a coach what that
                  path looks like. The club can point you to current information.
                </p>
                <ul className="plain-list">
                  <li>Bowling can continue beyond high school.</li>
                  <li>Some colleges offer bowling teams or collegiate bowling programs.</li>
                  <li>Opportunities and participation requirements vary by institution.</li>
                  <li>
                    Students interested in collegiate bowling can speak with coaches about developing skills,
                    tracking progress, and exploring programs.
                  </li>
                  <li>
                    Scholarship opportunities and eligibility depend on individual programs and applicable
                    requirements.
                  </li>
                </ul>
              </div>
              <div className="sw-club__links">
                <p>These USBC pages are general learning resources. They do not promise a scholarship, a roster spot, or eligibility.</p>
                <ul>
                  {collegeLinks.map((link) => (
                    <li key={link.href}>
                      <a href={link.href} target="_blank" rel="noopener noreferrer">
                        {link.label}
                        <span className="visually-hidden"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="club-action">
                  <Link className="sw-btn sw-btn--outline" to="/contact">
                    Ask a coach about college bowling
                  </Link>
                </p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="club-help-heading">
        <div className="wrap">
          <div className="sw-cta-band">
            <div>
              <h2 id="club-help-heading">Have questions? We&apos;re here to help.</h2>
              <p>
                Whether you&apos;re new to bowling, interested in joining the club, or want to learn about
                practices, tournaments, and opportunities beyond high school, our coaches can help you
                find the information you need.
              </p>
            </div>
            <Link className="sw-btn" to="/contact">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
