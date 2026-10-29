import { livePaymentDestinations, siteConnections, siteConnectionsConfig } from "../content/siteConnections"

/**
 * Public payment UI. Only verified + liveEnabled destinations appear.
 * Prepared-but-unapproved destinations never render as active checkout.
 */
export function PaymentOptions() {
  const live = livePaymentDestinations(siteConnectionsConfig)
  if (live.length === 0) {
    if (!import.meta.env.DEV || siteConnections.payments.approved) return null
    return (
      <div className="connect-pay">
        <p className="connect-pay__status">Design preview — payment not connected</p>
        <ul className="connect-pay__grid">
          {siteConnectionsConfig.payments.map((method) => (
            <li className="connect-pay__card" key={method.id}>
              <span className="connect-pay__name">{method.label}</span>
              <span className="connect-pay__state">Disabled</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="connect-pay">
      <p className="connect-pay__status">Approved payment options</p>
      <ul className="connect-pay__grid">
        {live.map((method) => (
          <li className="connect-pay__card" key={method.id}>
            {method.publicDestination?.startsWith("http") ? (
              <a href={method.publicDestination} target="_blank" rel="noopener noreferrer">
                {method.label}
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            ) : (
              <span className="connect-pay__name">
                {method.label}
                {method.publicDestination ? ` · ${method.publicDestination}` : null}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
