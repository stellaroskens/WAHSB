import { Link } from "react-router-dom"
import { library } from "../content/site"

export function WaysToContribute({
  preview,
}: {
  preview: "sponsorship" | "pledge"
}) {
  const copy = library.contributionOptions
  return (
    <div className="ways-to-contribute">
      <h2 id="ways-to-contribute-heading">{copy.heading}</h2>
      <p>{copy.intro}</p>
      <ul className="pay-options">
        {copy.options.map((option) => (
          <li key={option}>
            <strong>{option}</strong>
            <span>{copy.unavailable}</span>
          </li>
        ))}
      </ul>
      <p>{copy.warning}</p>
      <p>{preview === "pledge" ? copy.pledgeNote : copy.sponsorshipNote}</p>
      <p>
        <Link className="button button-secondary" to={copy.contactTo}>
          {copy.contactLabel}
        </Link>
      </p>
    </div>
  )
}
