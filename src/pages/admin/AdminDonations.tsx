import { useState } from "react"
import { Link } from "react-router-dom"
import { PageMeta } from "../../components/PageMeta"
import { StaffHelp } from "../../components/staff/StaffHelp"
import { siteConnectionsConfig } from "../../content/siteConnections"
import { library } from "../../content/site"
import { LAUNCH_CHECKLIST, destinationCouldGoLive, formatUsd, dollarsToCents } from "../../lib/payments/donations"

export function AdminDonations() {
  const [confirming, setConfirming] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const amounts = library.donations.suggestedAmounts
    .map((amount) => dollarsToCents(amount))
    .filter((amount): amount is number => amount != null)

  return (
    <div className="admin-page">
      <PageMeta title="Donations | Albany High School Bowling" description="Payment status for Albany High School Bowling." />
      <div className="admin-page__intro">
        <h2>
          Donations and sponsorships
          <StaffHelp
            label="Donations and sponsorships"
            text="This screen shows whether a real checkout can run. It does not charge a card. Visitors see the public Donate page. Live payments stay off until a super administrator verifies a destination and the owner sets the server flag. Coaches cannot open this screen."
          />
        </h2>
        <p>Transaction totals are not shown. No provider is connected, and this page does not store donor records.</p>
      </div>
      <ul className="admin-section-list">
        {siteConnectionsConfig.payments.map((payment) => {
          const ready = payment.status === "verified" && payment.liveEnabled && destinationCouldGoLive(payment.id, payment.publicDestination)
          return (
            <li key={payment.id} className="admin-section-list__item">
              <div>
                <h3>
                  {payment.label}
                  <StaffHelp
                    label={payment.label}
                    text={`${payment.label} changes whether that method can be offered on the public Donate page. Visitors see it only after verification, a live flag, and owner approval. Turning a destination on is a real payment change. Only a super administrator can verify it.`}
                  />
                </h3>
                <p>{ready ? "Verified destination on file." : "Not connected."}</p>
              </div>
              <span className="admin-badge">{ready ? "Verified" : "Not connected"}</span>
            </li>
          )
        })}
      </ul>
      <div className="admin-panel-form">
        <h3>
          Suggested amounts
          <StaffHelp
            label="Suggested amounts"
            text="These amounts appear as choices on the public Donate page. They do not charge anyone and they are not sponsorship packages. Publishing the wording still requires the content draft workflow. A super administrator edits the amounts on Website Pages."
          />
        </h3>
        <p>{amounts.map((cents) => formatUsd(cents)).join(", ") || "No valid amounts are published."}</p>
        <p>
          <Link to="/admin/content?page=donate">Edit donation wording</Link>
        </p>
        <p>
          Sponsorship packages are not configured. No package price or benefit list is published. A sponsor inquiry is not an approval.
        </p>
        <p>Refunds, disputes, and provider transaction lists stay in the provider dashboard until a private record store exists. There is nothing to export.</p>
        <button type="button" className="admin-btn" disabled>
          Activate live payments
        </button>
        <p className="staff-action__reason">
          Disabled until a destination is verified on Payment Connections, private donation storage exists, and the owner sets PAYMENTS_LIVE to true on the server.
        </p>
        {confirming ? <p role="status">{message}</p> : null}
        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          onClick={() => {
            if (!window.confirm("Disable every public payment method? Nothing is live, so this does not refund a gift.")) return
            setMessage("No public payment method is live. Nothing was changed.")
            setConfirming(true)
          }}
        >
          Confirm payments stay off
        </button>
        {message ? <p role="status">{message}</p> : null}
        <p>
          <Link to="/admin/connections">Payment Connections</Link>
        </p>
      </div>
      <div className="admin-panel-form">
        <h3>Launch checklist</h3>
        <ul>
          {LAUNCH_CHECKLIST.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>These items are not checked off. This page does not claim a charity registration.</p>
      </div>
    </div>
  )
}
