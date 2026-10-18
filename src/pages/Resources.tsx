import { AthleticHero, SectionHeading } from "../components/AthleticHero"
import { EmptyState } from "../components/EmptyState"
import { PageMeta } from "../components/PageMeta"
import {
  bowlingCenters,
  businessDirectionsUrl,
  listingDetails,
  proShops,
  type DirectoryListing,
} from "../content/resourceListings"
import { localServiceCategories, pages, resources, type ResourceCategory } from "../content/site"
import { telHref } from "../lib/calendar"

const sections: { category: ResourceCategory; title: string; intro: string; emptyTitle: string; empty: string }[] = [
  {
    category: "local",
    title: "Local bowling services",
    intro:
      "Fitting, drilling, redrilling, repairs, equipment orders, and shoes from businesses the club has agreed to list.",
    emptyTitle: "No local services are listed yet",
    empty:
      "Ball fitting, drilling, redrilling, repairs, equipment orders, and shoes will appear here after the club approves each business.",
  },
  {
    category: "equipment",
    title: "Suggested equipment",
    intro: "Balls, bags, shoes, and other gear the club is comfortable recommending.",
    emptyTitle: "No products are listed yet",
    empty: "Suggested equipment will appear here after the club approves it.",
  },
  {
    category: "learning",
    title: "Learning resources",
    intro: "Rules, high school bowling, and college bowling pages the club wants athletes to use.",
    emptyTitle: "No learning links are listed yet",
    empty: "Guides will appear here after the club approves them.",
  },
]

function DirectoryCard({ listing }: { listing: DirectoryListing }) {
  const details = listingDetails(listing)

  return (
    <article className="card resource-card">
      <h3>{listing.name}</h3>
      <p className="resource-city">{listing.city}</p>
      <p className="resource-address">{details.address ?? "Address: Not verified"}</p>
      <p className="resource-phone">
        {details.phone ? (
          <a href={telHref(details.phone)}>{details.phone}</a>
        ) : (
          "Phone: Not verified"
        )}
      </p>
      {listing.phoneNote ? <p className="resource-note">{listing.phoneNote}</p> : null}
      {listing.status ? <p className="resource-note">{listing.status}</p> : null}
      <div className="resource-hours">
        <h4>Business hours</h4>
        {listing.hours && listing.hours.length > 0 ? (
          <dl>
            {listing.hours.map((entry) => (
              <div key={entry.day}>
                <dt>{entry.day}</dt>
                <dd>{entry.text}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {listing.hoursNote ? <p>{listing.hoursNote}</p> : null}
      </div>
      {listing.points.length > 0 ? (
        <ul className="resource-points">
          {listing.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      ) : null}
      {details.address || details.phone || details.website ? (
        <p className="resource-actions">
          {details.address ? (
            <a
              className="resource-action resource-action--directions"
              href={businessDirectionsUrl(details.address)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get directions
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          ) : null}
          {details.phone ? (
            <a className="resource-action" href={telHref(details.phone)}>
              Call
            </a>
          ) : null}
          {details.website ? (
            <a
              className="resource-action"
              href={details.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit website
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          ) : null}
        </p>
      ) : null}
      {details.website ? null : <p className="resource-missing">Website: Not verified</p>}
    </article>
  )
}

function DirectorySection({
  id,
  title,
  intro,
  listings,
}: {
  id: string
  title: string
  intro: string
  listings: readonly DirectoryListing[]
}) {
  return (
    <section className="section resource-directory" id={id} aria-labelledby={`${id}-heading`}>
      <div className="wrap">
        <div className="sw-resources__directory-head">
          <SectionHeading id={`${id}-heading`} title={title}>
            <p>{intro}</p>
          </SectionHeading>
          <p className="resource-disclaimer">
            Hours and services may change. Please confirm directly with each business before visiting.
          </p>
        </div>
        <div className="card-grid card-grid-2 card-grid-3">
          {listings.map((listing) => (
            <DirectoryCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function Resources() {
  const visible = resources.filter((item) => item.approved)

  return (
    <div className="sw-page sw-resources">
      <PageMeta title={pages.resources.title} description={pages.resources.description} />
      <AthleticHero
        scene="resources"
        title="Bowling Resources"
        subtitle="Albany High School Bowling"
        art={
          <nav className="sw-topic-board" aria-label="Resource directories">
            <a href="#pro-shops">
              Bowling Pro Shops <span className="sw-topic-board__count">{proShops.length}</span>
            </a>
            <a href="#bowling-centers">
              Bowling Alleys &amp; Centers{" "}
              <span className="sw-topic-board__count">{bowlingCenters.length}</span>
            </a>
          </nav>
        }
      >
        <p>
          A shorter list than a page of every link. Each entry stays off this page
          until the club is ready to share it.
        </p>
      </AthleticHero>

      <div className="section">
        <div className="wrap sw-resources__trio">
          {sections.map((section) => {
            const items = visible.filter((item) => item.category === section.category)
            return (
              <section className="sw-panel sw-resources__category" key={section.category}>
                <div>
                  <div className="section-heading">
                    <h2>{section.title}</h2>
                    <p>{section.intro}</p>
                  </div>
                  {section.category === "local" ? (
                    <ul className="tag-list" aria-label="Service categories">
                      {localServiceCategories.map((service) => (
                        <li key={service}>{service}</li>
                      ))}
                    </ul>
                  ) : null}
                  {items.length === 0 ? (
                    <EmptyState title={section.emptyTitle}>{section.empty}</EmptyState>
                  ) : (
                    <div className="card-grid">
                      {items.map((item) => (
                        <article className="card" key={item.id}>
                          <h3>{item.title}</h3>
                          <p>{item.description}</p>
                          {item.services && item.services.length > 0 ? (
                            <ul className="tag-list" aria-label={`${item.title} services`}>
                              {item.services.map((service) => (
                                <li key={service}>{service}</li>
                              ))}
                            </ul>
                          ) : null}
                          {item.href ? (
                            <p>
                              <a href={item.href} rel="noreferrer">
                                Visit {item.title}
                              </a>
                            </p>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )
          })}
        </div>
      </div>

      <DirectorySection
        id="pro-shops"
        title="Bowling Pro Shops"
        intro="Looking for a properly fitted bowling ball, drilling services, resurfacing, or new equipment? Explore these pro shops throughout Oregon. Contact each business directly to confirm current services, hours, and availability."
        listings={proShops}
      />
      <DirectorySection
        id="bowling-centers"
        title="Bowling Alleys & Centers"
        intro="Explore bowling centers throughout Oregon for recreation, practice, leagues, and family bowling. Locations are listed approximately from closest to farthest from Albany."
        listings={bowlingCenters}
      />
    </div>
  )
}
