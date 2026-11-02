import { type FormEvent, useState } from "react"
import { siteConnectionsConfig } from "../content/siteConnections"
import { library } from "../content/site"
import {
  PAYMENT_METHODS,
  decideDonationCheckout,
  dollarsToCents,
  formatUsd,
  methodExplanation,
  type DonationMethod,
} from "../lib/payments/donations"

const METHOD_LABELS: Record<DonationMethod, string> = {
  card: "Card, Apple Pay, or Google Pay",
  paypal: "PayPal",
  venmo: "Venmo",
  cash_app: "Cash App",
}

export function QuickDonate() {
  const suggestions = library.donations.suggestedAmounts
    .map((amount) => dollarsToCents(amount))
    .filter((amount): amount is number => amount != null)
  const [selected, setSelected] = useState<string>(suggestions[0] ? String(suggestions[0]) : "custom")
  const [custom, setCustom] = useState("")
  const [method, setMethod] = useState<DonationMethod>("card")
  const [result, setResult] = useState<string | null>(null)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const amountCents = selected === "custom" ? dollarsToCents(custom) : Number(selected)
    const decision = decideDonationCheckout({
      amountCents,
      method,
      paymentsLive: false,
      recordsConfigured: false,
      stripeConfigured: false,
      connections: siteConnectionsConfig,
    })
    setResult(decision.ok ? library.donations.unavailable : decision.error)
  }

  return (
    <form className="quick-donate" onSubmit={onSubmit}>
      <fieldset>
        <legend>Amount</legend>
        <div className="quick-donate__amounts">
          {suggestions.map((cents) => (
            <label key={cents}>
              <input
                type="radio"
                name="donation-amount"
                value={String(cents)}
                checked={selected === String(cents)}
                onChange={() => setSelected(String(cents))}
              />
              {formatUsd(cents)}
            </label>
          ))}
          <label>
            <input
              type="radio"
              name="donation-amount"
              value="custom"
              checked={selected === "custom"}
              onChange={() => setSelected("custom")}
            />
            {library.donations.customLabel}
          </label>
        </div>
        {selected === "custom" ? (
          <label>
            Dollars
            <input
              inputMode="decimal"
              autoComplete="off"
              value={custom}
              onChange={(event) => setCustom(event.target.value)}
              aria-describedby="donation-amount-hint"
            />
          </label>
        ) : null}
        <p id="donation-amount-hint">Suggested amounts can be changed by a super administrator. They are not sponsorship packages.</p>
      </fieldset>
      <fieldset>
        <legend>{library.donations.methodsHeading}</legend>
        {PAYMENT_METHODS.map((item) => (
          <label key={item} className="quick-donate__method">
            <input
              type="radio"
              name="donation-method"
              value={item}
              checked={method === item}
              onChange={() => setMethod(item)}
            />
            <span>
              <strong>{METHOD_LABELS[item]}</strong>
              <small>{methodExplanation(item)} Not connected.</small>
            </span>
          </label>
        ))}
      </fieldset>
      <button className="sw-btn" type="submit">Review this amount</button>
      <p role="status">{result ?? library.donations.unavailable}</p>
    </form>
  )
}
