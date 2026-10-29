import { Link } from "react-router-dom"
import { AthleticHero } from "../components/AthleticHero"
import { PageMeta } from "../components/PageMeta"
import { club } from "../content/site"
import { siteConnections } from "../content/siteConnections"
import { sponsorshipQrImageUrl, sponsorshipQrTarget } from "../lib/sponsorQr"

export function SponsorQr() {
  const target = sponsorshipQrTarget(siteConnections.sharing.publicSponsorshipUrl)

  return (
    <div className="sw-page">
      <PageMeta
        title="Sponsorship QR | Albany High School Bowling"
        description="Printable sponsorship QR code for Albany High School Bowling. Available only after an approved public sponsorship URL is configured."
      />
      <AthleticHero scene="team" eyebrow="Sponsors" title="Sponsorship QR" subtitle={club.name}>
        <p>Scan or print only when an approved public sponsorship link is ready.</p>
      </AthleticHero>

      <div className="section">
        <div className="wrap narrow">
          {target ? (
            <article className="card">
              <h2>Approved sponsorship link</h2>
              <p>
                This QR encodes the club-approved public URL. It does not confirm a payment or create a sponsorship
                account.
              </p>
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
              <h2>Not ready yet</h2>
              <p>
                No approved public sponsorship URL is configured. Staff can prepare the destination under Admin →
                Connections. This page will not show a QR code or accept payments until that URL is verified and live.
              </p>
              <p>
                <Link to="/sponsors">Back to Sponsors</Link>
              </p>
            </article>
          )}
        </div>
      </div>
    </div>
  )
}
