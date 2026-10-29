import { approvedPublicHttps } from "./content/siteConnectionsModel.ts"

/**
 * Sponsorship QR target — only an approved public https URL.
 * Never invents a payment destination or confirmation.
 */
export function sponsorshipQrTarget(publicSponsorshipUrl: string | null | undefined): string | null {
  return approvedPublicHttps(publicSponsorshipUrl ?? null)
}

/** Third-party QR image for an already-approved public URL only. */
export function sponsorshipQrImageUrl(target: string): string {
  const params = new URLSearchParams({
    size: "280x280",
    data: target,
  })
  return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`
}
