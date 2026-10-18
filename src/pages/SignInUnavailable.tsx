import { Link } from "react-router-dom"
import { AthleticHero } from "../components/AthleticHero"
import { PageMeta } from "../components/PageMeta"

/** Shown on builds where team accounts are switched off. No account service is contacted. */
export function SignInUnavailable() {
  return (
    <div className="sw-page">
      <PageMeta title="Sign In | Albany High School Bowling" description="Team accounts are not open yet. Every public page works without signing in." />
      <AthleticHero scene="team" eyebrow="Coming later" title="Sign In" subtitle="Team accounts are not open yet">
        <p>Every page on this site is public and works without an account.</p>
      </AthleticHero>
      <div className="section">
        <div className="wrap narrow">
          <p>
            Team, parent, and coach accounts will open after the club approves them. Until then, questions can go to the
            coaches through the <Link to="/contact">Contact Us</Link> page.
          </p>
        </div>
      </div>
    </div>
  )
}
