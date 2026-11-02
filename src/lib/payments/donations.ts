import {
  approvedPublicHttps,
  type PaymentProviderId,
  type SiteConnectionsConfig,
} from "../content/siteConnectionsModel.ts"

/** Whole cents. $1 is the smallest gift this site will ask a provider to charge. */
export const MIN_DONATION_CENTS = 100
/** $1,000. A larger gift needs a reviewed checkout, not an unchecked browser field. */
export const MAX_DONATION_CENTS = 100_000
export const DONATION_CURRENCY = "usd"

export const PAYMENT_METHODS = ["card", "paypal", "venmo", "cash_app"] as const
export type DonationMethod = (typeof PAYMENT_METHODS)[number]

const METHOD_PROVIDER: Record<DonationMethod, PaymentProviderId> = {
  card: "stripe",
  paypal: "paypal",
  venmo: "venmo",
  cash_app: "cash_app",
}

export type CheckoutRefusal = {
  ok: false
  status: number
  code: string
  error: string
  paid: false
  saved: false
}

export type CheckoutAcceptance = {
  ok: true
  amountCents: number
  currency: typeof DONATION_CURRENCY
  method: DonationMethod
  provider: PaymentProviderId
}

export function dollarsToCents(input: string): number | null {
  const trimmed = input.trim()
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null
  const [whole, fraction = ""] = trimmed.split(".")
  if (whole.length > 6) return null
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"))
  return acceptCents(cents)
}

export function parseDonationAmountCents(value: unknown): number | null {
  if (typeof value === "number") return acceptCents(value)
  if (typeof value === "string" && /^\d+$/.test(value)) return acceptCents(Number(value))
  return null
}

function acceptCents(value: number): number | null {
  if (!Number.isSafeInteger(value)) return null
  if (value < MIN_DONATION_CENTS || value > MAX_DONATION_CENTS) return null
  return value
}

export function formatUsd(cents: number): string {
  const dollars = Math.floor(cents / 100)
  const remainder = String(cents % 100).padStart(2, "0")
  return `$${dollars}.${remainder}`
}

/** A destination that could later be shown. Personal profiles and secret values stay out. */
export function destinationCouldGoLive(provider: PaymentProviderId, destination: string | null): boolean {
  const url = approvedPublicHttps(destination)
  if (!url) return false
  let host = ""
  try {
    host = new URL(url).hostname.toLowerCase()
  } catch {
    return false
  }
  if (provider === "stripe") return host === "buy.stripe.com" || host === "checkout.stripe.com"
  if (provider === "paypal") return host === "www.paypal.com" || host === "paypal.com"
  if (provider === "venmo") return host === "www.paypal.com" || host === "paypal.com"
  if (provider === "cash_app") return host === "cash.app"
  return false
}

export function methodExplanation(method: DonationMethod): string {
  if (method === "card") {
    return "Credit cards, debit cards, Apple Pay, and Google Pay would open inside Stripe Checkout. This site does not collect card numbers."
  }
  if (method === "paypal") {
    return "PayPal uses an official PayPal checkout or donation page. A paypal.me link is not treated as an organizational destination."
  }
  if (method === "venmo") {
    return "Venmo is not a separate button. It can appear inside a verified PayPal checkout. A personal Venmo profile is not used."
  }
  return "Cash App stays optional. A redirect is not a receipt, and no Cash App handle is published here."
}

export function decideDonationCheckout(input: {
  amountCents: unknown
  method: unknown
  paymentsLive: boolean
  recordsConfigured: boolean
  stripeConfigured: boolean
  connections: SiteConnectionsConfig
}): CheckoutRefusal | CheckoutAcceptance {
  const amountCents = parseDonationAmountCents(input.amountCents)
  if (amountCents == null) {
    return refusal(400, "invalid_amount", "Enter a whole amount from $1.00 to $1,000.00. The server does not use any other price.")
  }
  if (typeof input.method !== "string" || !(PAYMENT_METHODS as readonly string[]).includes(input.method)) {
    return refusal(400, "invalid_method", "Choose a supported payment method.")
  }
  const method = input.method as DonationMethod
  if (!input.paymentsLive) {
    return refusal(503, "payments_not_live", "Live payments are off. Choosing an amount does not charge a card or create a donation record.")
  }
  const provider = METHOD_PROVIDER[method]
  const connection = input.connections.payments.find((item) => item.id === provider)
  if (!connection || connection.status !== "verified" || connection.liveEnabled !== true || !destinationCouldGoLive(provider, connection.publicDestination)) {
    return refusal(503, "provider_not_configured", `${connection?.label ?? "That method"} is not a verified live destination.`)
  }
  if (!input.recordsConfigured) {
    return refusal(503, "donation_records_unavailable", "Private donation records are not configured, so checkout stays off.")
  }
  if (method === "card" && !input.stripeConfigured) {
    return refusal(503, "stripe_not_configured", "Stripe is not configured on the server.")
  }
  return { ok: true, amountCents, currency: DONATION_CURRENCY, method, provider }
}

function refusal(status: number, code: string, error: string): CheckoutRefusal {
  return { ok: false, status, code, error, paid: false, saved: false }
}

export const LAUNCH_CHECKLIST = [
  "Confirm the legal organization name that should appear on provider accounts.",
  "Name the person authorized to own the payment account.",
  "Connect the bank account that should receive settlements, inside the provider dashboard.",
  "Verify Stripe, PayPal, Venmo-through-PayPal, and any Cash App destination before a button is shown.",
  "Write a refund and dispute policy the club is willing to publish.",
  "Publish a privacy policy that covers donor and guardian information.",
  "Keep a public contact path for payment questions.",
  "Confirm Oregon charitable solicitation rules before calling the program a registered charity.",
  "Do not describe gifts as tax deductible until the club confirms that status in writing. No EIN is published here.",
  "Review who can open the provider dashboards. Coaches do not administer payments.",
] as const
