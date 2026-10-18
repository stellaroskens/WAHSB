/**
 * Official accounts are added here later.
 * Leave every address empty until the club supplies and approves it.
 * A payment address does not turn checkout on. `payments.approved` stays false
 * until a real provider has been tested.
 * Apple Pay and Google Pay are not separate address fields. They require a
 * hosted checkout from an approved provider.
 */

export type SiteConnections = {
  social: {
    facebook: string | null
    instagram: string | null
    youtube: string | null
    tiktok: string | null
  }
  sharing: {
    publicWebsiteUrl: string | null
    publicFundraiserUrl: string | null
  }
  payments: {
    paypalDonationUrl: string | null
    venmoDonationUrl: string | null
    hostedCheckoutUrl: string | null
    approved: boolean
  }
}

export const siteConnections: SiteConnections = {
  social: {
    facebook: null,
    instagram: null,
    youtube: null,
    tiktok: null,
  },
  sharing: {
    publicWebsiteUrl: null,
    publicFundraiserUrl: null,
  },
  payments: {
    paypalDonationUrl: null,
    venmoDonationUrl: null,
    hostedCheckoutUrl: null,
    approved: false,
  },
}

/** Public https addresses only. Local and temporary hosts are rejected. */
export function approvedPublicHttps(value: string | null): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    if (url.protocol !== "https:") return null
    const host = url.hostname.toLowerCase()
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host.endsWith(".local")
    ) {
      return null
    }
    return url.toString()
  } catch {
    return null
  }
}
