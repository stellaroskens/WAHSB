import { Link } from "react-router-dom"

const options = [
  "Approved bank or credit union payment instructions",
  "Official donation processor",
  "Approved online payment service",
  "Instructions for checks or other contributions",
] as const

export function WaysToContribute({
  preview,
}: {
  preview: "sponsorship" | "pledge"
}) {
  return (
    <div className="ways-to-contribute">
      <h2 id="ways-to-contribute-heading">Ways to contribute</h2>
      <p>
        Official payment links will appear here after the club supplies and verifies
        them. No bank account, routing number, or payment service is connected on
        this website.
      </p>
      <ul className="pay-options">
        {options.map((option) => (
          <li key={option}>
            <strong>{option}</strong>
            <span>Not available until the club verifies an official destination.</span>
          </li>
        ))}
      </ul>
      <p>
        Do not send credit card or banking details through this website. This form
        does not have fields for them.
      </p>
      {preview === "pledge" ? (
        <p>
          The pledge form on this page is a preview. It does not submit, save, or
          receive a payment.
        </p>
      ) : (
        <p>
          The sponsorship form on this page prepares an email. It does not submit,
          save, or receive a payment.
        </p>
      )}
      <p>
        <Link className="button button-secondary" to="/contact">
          Contact the coaches
        </Link>
      </p>
    </div>
  )
}
