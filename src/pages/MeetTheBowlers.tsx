import { AthleticHero } from "../components/AthleticHero"
import { PageMeta } from "../components/PageMeta"
import { SeasonClosedNotice } from "../components/SeasonClosedNotice"
import { bowlerProfiles, pageBodies, pages } from "../content/site"
import { visibleBowlerProfiles } from "../lib/content/bowlerProfiles"

export function MeetTheBowlers() {
  const profiles = visibleBowlerProfiles(bowlerProfiles)
  const copy = pageBodies.bowlers

  return (
    <div className="sw-page sw-bowlers">
      <PageMeta title={pages.bowlers.title} description={pages.bowlers.description} />
      <AthleticHero scene="team" eyebrow={copy.eyebrow} title={copy.title}>
        <p>{copy.intro}</p>
        <SeasonClosedNotice showVolunteerCta={false} />
      </AthleticHero>

      <section className="section" aria-label="Approved profiles">
        <div className="wrap">
          {profiles.length === 0 ? (
            <p className="sw-bowlers__empty">{copy.empty}</p>
          ) : (
            <div className="sw-bowlers__grid">
              {profiles.map((profile) => (
                <article className="sw-bowler" key={profile.id}>
                  <img src={profile.imagePath} width={240} height={240} alt={profile.imageAlt} />
                  <p className="sw-chip sw-chip--red">{profile.roleLabel}</p>
                  <h3>{profile.displayName}</h3>
                  <p>{profile.introduction}</p>
                  <p>
                    <strong>Favorite thing about bowling: </strong>
                    {profile.favoriteThing}
                  </p>
                  {profile.interests ? (
                    <p>
                      <strong>Bowling interests: </strong>
                      {profile.interests}
                    </p>
                  ) : null}
                  {profile.quote ? <blockquote>{profile.quote}</blockquote> : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
