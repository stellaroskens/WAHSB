import { siteConnections } from "../content/siteConnections"

const methods = ["Apple Pay", "Google Pay", "Venmo", "PayPal"] as const

/**
 * Design preview only. Checkout stays off until a later task verifies a provider.
 * `payments.approved` alone does not render a pay button.
 */
export function PaymentOptions() {
  if (!import.meta.env.DEV || siteConnections.payments.approved) return null

  return (
    <div className="connect-pay">
      <p className="connect-pay__status">Design preview — payment not connected</p>
      <ul className="connect-pay__grid">
        {methods.map((method) => (
          <li className="connect-pay__card" key={method}>
            <span className="connect-pay__name">{method}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
