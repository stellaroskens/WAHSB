/**
 * Official connection destinations for social, email, and payments.
 * Public files store only public URLs/handles and status flags — never passwords or API secrets.
 * Payment options stay disabled until a super_admin verifies and enables them.
 */
import published from "./published/siteConnections.json"
import {
  approvedPublicHttps,
  anyPaymentsLive,
  parseSiteConnections,
  type PaymentProviderId,
  type SiteConnectionsConfig,
  type SocialNetworkId,
} from "../lib/content/siteConnectionsModel.ts"

export {
  approvedPublicHttps,
  approvedPublicDestination,
  looksLikeSecret,
  livePaymentDestinations,
  anyPaymentsLive,
  validateSiteConnections,
  parseSiteConnections,
} from "../lib/content/siteConnectionsModel.ts"

export type {
  ConnectionStatus,
  EmailConnection,
  PaymentConnection,
  PaymentProviderId,
  SiteConnectionsConfig,
  SocialConnection,
  SocialNetworkId,
} from "../lib/content/siteConnectionsModel.ts"

export const siteConnectionsConfig: SiteConnectionsConfig = parseSiteConnections(published)

/** @deprecated Prefer siteConnectionsConfig — kept for existing social/payment components. */
export type SiteConnections = {
  social: Record<SocialNetworkId, string | null>
  sharing: {
    publicWebsiteUrl: string | null
    publicFundraiserUrl: string | null
    publicSponsorshipUrl: string | null
  }
  payments: {
    paypalDonationUrl: string | null
    venmoDonationUrl: string | null
    hostedCheckoutUrl: string | null
    approved: boolean
  }
}

function liveSocialUrl(id: SocialNetworkId): string | null {
  const entry = siteConnectionsConfig.social.find((item) => item.id === id)
  if (!entry || !entry.liveEnabled || entry.status !== "verified") return null
  return approvedPublicHttps(entry.publicUrl)
}

function livePaymentUrl(id: PaymentProviderId): string | null {
  const entry = siteConnectionsConfig.payments.find((item) => item.id === id)
  if (!entry || !entry.liveEnabled || entry.status !== "verified") return null
  return entry.publicDestination
}

export const siteConnections: SiteConnections = {
  social: {
    facebook: liveSocialUrl("facebook"),
    instagram: liveSocialUrl("instagram"),
    youtube: liveSocialUrl("youtube"),
    tiktok: liveSocialUrl("tiktok"),
  },
  sharing: {
    publicWebsiteUrl: approvedPublicHttps(siteConnectionsConfig.sharing.publicWebsiteUrl),
    publicFundraiserUrl: approvedPublicHttps(siteConnectionsConfig.sharing.publicFundraiserUrl),
    publicSponsorshipUrl: approvedPublicHttps(siteConnectionsConfig.sharing.publicSponsorshipUrl),
  },
  payments: {
    paypalDonationUrl: livePaymentUrl("paypal"),
    venmoDonationUrl: livePaymentUrl("venmo"),
    hostedCheckoutUrl: livePaymentUrl("stripe"),
    approved: anyPaymentsLive(siteConnectionsConfig),
  },
}
