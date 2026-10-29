import { Link } from "react-router-dom"
import { AthleticHero } from "../components/AthleticHero"
import { PageMeta } from "../components/PageMeta"
import { club } from "../content/site"

export function Privacy() {
  return (
    <div className="sw-page sw-privacy">
      <PageMeta
        title="Privacy"
        description="How Albany High School Bowling handles information on this public website."
      />
      <AthleticHero scene="privacy" eyebrow="Website notice" title="Privacy" subtitle={club.name}>
        <p>
          This page explains what this public website does and does not collect. It is a brochure site
          for {club.name}. It is not a student-records system, payment processor, or private messaging
          platform.
        </p>
      </AthleticHero>

      <section className="section" aria-labelledby="privacy-summary-heading">
        <div className="wrap">
          <article className="card">
            <h2 id="privacy-summary-heading">Summary</h2>
            <ul className="plain-list">
              <li>Public pages describe the club, events, volunteering, and ways to support athletes.</li>
              <li>This site does not store private student grades, medical data, or account credentials in the repository.</li>
              <li>The contact form on this site does not send or save messages in the current build.</li>
              <li>Staff administration, when enabled later, uses invitation-only Netlify Identity and stays off by default.</li>
              <li>Payment and donation destinations stay disabled until a club administrator verifies them.</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="privacy-hosting-heading">
        <div className="wrap">
          <article className="card">
            <h2 id="privacy-hosting-heading">Hosting and technical logs</h2>
            <p>
              The site is hosted on Netlify. Like most websites, the host may process standard request
              logs (such as IP address, user agent, and requested URL) for security, reliability, and
              operations. Those logs are controlled by the hosting provider’s policies, not by custom
              analytics code in this project.
            </p>
            <p>
              This codebase does not embed third-party marketing analytics trackers. External links
              (for example BSN SPORTS, social profiles, maps, or calendar services) are governed by
              those providers when you leave this site.
            </p>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="privacy-contact-heading">
        <div className="wrap">
          <article className="card">
            <h2 id="privacy-contact-heading">Contact and email</h2>
            <p>
              Club email is listed publicly so families can reach leadership. Messages you send by
              email are handled outside this website. The on-site contact form is a layout preview and
              currently reports that nothing was sent.
            </p>
            <p>
              Email: <a href={`mailto:${club.email}`}>{club.email}</a>
            </p>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="privacy-photos-heading">
        <div className="wrap">
          <article className="card">
            <h2 id="privacy-photos-heading">Photos and student information</h2>
            <p>
              Published pages should only show information the club has approved for public view.
              Real student private records must not be committed to this repository. Future photo
              permission and parent-account features are not enabled on this release.
            </p>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="privacy-staff-heading">
        <div className="wrap">
          <article className="card">
            <h2 id="privacy-staff-heading">Staff access</h2>
            <p>
              Staff routes under <code>/staff</code>, <code>/admin</code>, <code>/coach</code>, and{" "}
              <code>/team-administrator</code> are not open to the public. Production staff
              authentication remains disabled until the club owner enables Netlify Identity
              (invite-only) and related environment flags. See the admin setup documentation for
              that owner-controlled process.
            </p>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="privacy-questions-heading">
        <div className="wrap">
          <article className="card">
            <h2 id="privacy-questions-heading">Questions</h2>
            <p>
              For privacy questions about club communications, email{" "}
              <a href={`mailto:${club.email}`}>{club.email}</a> or use the{" "}
              <Link to="/contact">Contact</Link> page for leadership contact details.
            </p>
          </article>
        </div>
      </section>
    </div>
  )
}
