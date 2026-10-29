import { Link } from "react-router-dom"
import { AthleticHero } from "../components/AthleticHero"
import { PageMeta } from "../components/PageMeta"
import {
  FAMILY_ACCESS_OPEN,
  FAMILY_ACCESS_PENDING_MESSAGE,
  FAMILY_DASHBOARD_PLANNED,
} from "../lib/family/familyAccess"

/**
 * Public, non-sensitive preview of the future family dashboard. It must not show household or student
 * information until guardian verification, a protected database, and per-record authorization exist.
 */
export function FamilyDashboard() {
  return (
    <div className="sw-page">
      <PageMeta
        title="Family Page | Albany High School Bowling"
        description="What the Albany High School Bowling family page will include once invitation-only family access opens."
      />
      <AthleticHero scene="team" eyebrow={FAMILY_ACCESS_OPEN ? "Families" : "Coming soon"} title="Family Page">
        <p>{FAMILY_ACCESS_PENDING_MESSAGE}</p>
      </AthleticHero>

      <section className="section signin">
        <div className="wrap signin__wrap">
          <div className="sw-panel signin__panel">
            <h2 className="signin__panel-title">What families will find here</h2>
            <ul className="signin-planned">
              {FAMILY_DASHBOARD_PLANNED.map((item) => (
                <li key={item.title}>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </li>
              ))}
            </ul>
            <p className="signin-help">
              No team photo of a student is published without specific permission from a verified parent or guardian, and
              that permission can be withdrawn at any time.
            </p>
            <p className="signin-help">
              Public team information is available now: <Link to="/practices">practices</Link>,{" "}
              <Link to="/tournaments">tournaments</Link>, <Link to="/resources">resources</Link>, and the{" "}
              <Link to="/faq">FAQ</Link>.
            </p>
            <Link className="button button-secondary" to="/sign-in">
              Back to Team &amp; Family Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
