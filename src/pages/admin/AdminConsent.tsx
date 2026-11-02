import { Link } from "react-router-dom"
import { PageMeta } from "../../components/PageMeta"
import { CONSENT_NOT_SAVED, CONSENT_STORE_SETUP } from "../../lib/content/bowlerConsent"

export function AdminConsent() {
  return (
    <div className="admin-page">
      <PageMeta
        title="Guardian Consent | Albany High School Bowling"
        description="Guardian consent readiness for Albany High School Bowling."
      />
      <div className="admin-page__intro">
        <h2>Guardian Consent</h2>
        <p>{CONSENT_NOT_SAVED}</p>
        <p>
          Real student profiles stay unpublished until a private consent store is connected and a reviewed database
          client is writing only there. A checkbox on this website is not guardian authority.
        </p>
        <p>
          <Link to="/admin/bowlers">Meet the Bowlers</Link>
          {" · "}
          <Link to="/admin">Return to Main Admin Dashboard</Link>
        </p>
      </div>
      <ol>
        {CONSENT_STORE_SETUP.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p className="admin-alert" role="status">
        Do not enter a guardian name, email, phone, address, or birth date here. This screen does not save a consent
        record.
      </p>
    </div>
  )
}
