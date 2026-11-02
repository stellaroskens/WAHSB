import { Link } from "react-router-dom"
import { AthleticHero } from "../components/AthleticHero"
import { PageMeta } from "../components/PageMeta"
import { club, library } from "../content/site"
import { siteConnections } from "../content/siteConnections"
import { sponsorshipQrImageUrl, sponsorshipQrTarget } from "../lib/sponsorQr"

export function SponsorQr() {
  const target = sponsorshipQrTarget(siteConnections.sharing.publicSponsorshipUrl)

  return (
    <div className="sw-page">
      <PageMeta title={library.sponsorQr.title} description={library.sponsorQr.description} />
      <AthleticHero scene="team" eyebrow="Sponsors" title="Sponsorship QR" subtitle={club.name}>
        <p>{library.sponsorQr.hero}</p>
      </AthleticHero>

      <div className="section">
        <div className="wrap narrow">
          {target ? (
            <article className="card">
              <h2>{library.sponsorQr.readyHeading}</h2>
              <p>{library.sponsorQr.readyBody}</p>
              <p>
                <a href={target} target="_blank" rel="noopener noreferrer">
                  {target}
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </p>
              <p className="sponsor-qr">
                <img src={sponsorshipQrImageUrl(target)} width={280} height={280} alt="Sponsorship QR code" />
              </p>
            </article>
          ) : (
            <article className="card">
              <h2>{library.sponsorQr.emptyHeading}</h2>
              <p>{library.sponsorQr.emptyBody}</p>
              <p>
                <Link to="/sponsors">{library.sponsorQr.backLabel}</Link>
              </p>
            </article>
          )}
        </div>
      </div>
    </div>
  )
}
