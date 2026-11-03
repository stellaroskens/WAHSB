import { Link } from "react-router-dom"
import { AthleticHero } from "../components/AthleticHero"
import { PageMeta } from "../components/PageMeta"
import { QuickDonate } from "../components/QuickDonate"
import { club, library, pages } from "../content/site"

export function Donate() {
  const result = new URLSearchParams(window.location.search).get("result")
  return (
    <div className="sw-page">
      <PageMeta title={pages.donate.title} description={pages.donate.description} />
      <AthleticHero scene="sponsors" eyebrow="AHSB" title={library.donations.headline} subtitle={club.name}>
        <p>{library.donations.intro}</p>
      </AthleticHero>
      <section className="section">
        <div className="wrap sw-panel quick-donate-panel">
          {result === "canceled" ? <p role="status">Checkout was canceled. No payment was recorded.</p> : null}
          {result === "returned" ? (
            <p role="status">Returning from a provider does not confirm a payment. This site has no verified receipt for this visit.</p>
          ) : null}
          <h2>{library.donations.contributionHeading}</h2>
          <p>{library.donations.why}</p>
          <QuickDonate />
          <p>{library.donations.secureNote}</p>
          <p>{library.donations.taxNote}</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap sw-panel">
          <h2>{library.donations.businessHeading}</h2>
          <p>{library.donations.businessBody}</p>
          <p>
            <Link className="sw-btn" to={library.donations.inquiryTo}>{library.donations.inquiryLabel}</Link>
          </p>
          <h2>{library.donations.questionsHeading}</h2>
          {library.donations.faq.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
          <p>
            {library.donations.contactNote} <a href={`mailto:${club.email}`}>{club.email}</a>
          </p>
        </div>
      </section>
    </div>
  )
}
