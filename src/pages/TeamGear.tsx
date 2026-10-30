import { AthleticHero } from "../components/AthleticHero"
import { ExternalLinkIcon } from "../components/header/icons"
import { PageMeta } from "../components/PageMeta"
import { websiteLogoTransparent } from "../content/media"
import { club, pageBodies, pages, teamGearShop } from "../content/site"

export function TeamGear() {
  return (
    <div className="sw-page sw-team-gear">
      <PageMeta title={pages.teamGear.title} description={pages.teamGear.description} />
      <AthleticHero
        scene="gear"
        eyebrow={pageBodies.teamGear.eyebrow}
        title={pageBodies.teamGear.title}
        subtitle={club.name}
        art={
          <img
            className="sw-team-gear__logo"
            src={websiteLogoTransparent.src}
            srcSet={websiteLogoTransparent.srcSet}
            sizes="(max-width: 899px) 70vw, 30vw"
            width={websiteLogoTransparent.width}
            height={websiteLogoTransparent.height}
            alt=""
          />
        }
      />

      <section className="section" aria-labelledby="team-gear-shop-heading">
        <div className="wrap">
          <article className="card sw-team-gear__card">
            <h2 id="team-gear-shop-heading">{pageBodies.teamGear.heading}</h2>
            <p>{`${pageBodies.teamGear.leadBeforeShopName} ${teamGearShop.name}.`}</p>
            <p className="sw-team-gear__actions">
              <a
                className="sw-btn sw-btn--plain"
                href={teamGearShop.teamStoreUrl ?? teamGearShop.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {pageBodies.teamGear.buttonBeforeShopName} {teamGearShop.name}
                <ExternalLinkIcon />
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </p>
            {teamGearShop.teamStoreUrl === null ? (
              <p className="sw-team-gear__note">
                {pageBodies.teamGear.missingStorefrontNote}
              </p>
            ) : null}
          </article>
        </div>
      </section>
    </div>
  )
}
