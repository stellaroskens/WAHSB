export type SystemStatusInput = {
  githubContentTokenConfigured: boolean
  adminAuthEnabled: boolean
  consentDatabaseConfigured: boolean
  emailStatus: string
  emailLive: boolean
  payments: { id: string; label: string; status: string; liveEnabled: boolean }[]
  familyAccessOpen: boolean
}

export type SystemStatusReport = ReturnType<typeof systemStatusReport>

const PROVIDER_LINKS = [
  {
    label: "Netlify environment variables",
    href: "https://app.netlify.com/sites/albany-hs-bowling/configuration/env",
  },
  { label: "Netlify Identity", href: "https://app.netlify.com/sites/albany-hs-bowling/identity" },
  { label: "GitHub fine-grained tokens", href: "https://github.com/settings/personal-access-tokens" },
  { label: "Netlify deploys", href: "https://app.netlify.com/sites/albany-hs-bowling/deploys" },
] as const

/**
 * Public setup report. Callers must pass booleans and statuses only.
 * This function has no access to tokens, and its result must not grow secret fields.
 */
export function systemStatusReport(input: SystemStatusInput) {
  const pending = [
    input.githubContentTokenConfigured
      ? "GitHub publishing is configured. Save a draft and confirm GitHub returns a commit before treating it as stored."
      : "Set GITHUB_CONTENT_TOKEN as a Netlify function secret. Drafts and publishing cannot be saved until then.",
    input.adminAuthEnabled
      ? "Server authentication is enabled. Staff roles still come only from Netlify Identity."
      : "Set ADMIN_AUTH_ENABLED to the exact value true in Netlify before relying on staff APIs.",
    input.consentDatabaseConfigured
      ? "A consent database variable is present, but no reviewed database client is connected. Consent is not saved."
      : "Provision Netlify Database before recording guardian consent. Do not store consent in GitHub.",
    input.familyAccessOpen
      ? "Family access is marked open. Confirm private storage and server checks before using it."
      : "Family accounts stay closed until private storage and server-side household checks exist.",
    "Email sending is disabled. Announcement drafts are not delivered.",
    "Student photo uploads stay off. Private image storage is not configured.",
    "Netlify deploy status is not read by this website. Open the Netlify deploys page to see it.",
  ]
  if (input.emailLive) {
    pending.push("Email is marked live in the connections file. The announcement function still does not send mail.")
  }
  for (const payment of input.payments) {
    if (payment.liveEnabled || payment.status === "verified") {
      pending.push(`${payment.label} is marked ${payment.status}. Live checkout still requires verification plus super administrator approval.`)
    }
  }

  return {
    githubPublishing: {
      configured: input.githubContentTokenConfigured,
      detail: input.githubContentTokenConfigured
        ? "GitHub publishing is configured for Functions. This screen does not show the token."
        : "GITHUB_CONTENT_TOKEN is not set. Nothing can be saved to GitHub.",
    },
    netlifyDeploy: {
      available: false,
      detail: "Deploy status is not queried from this website. Open the Netlify deploys page.",
      href: "https://app.netlify.com/sites/albany-hs-bowling/deploys",
    },
    authentication: {
      enabled: input.adminAuthEnabled,
      detail: input.adminAuthEnabled
        ? "Server authentication is enabled. Roles still come from Netlify Identity."
        : "ADMIN_AUTH_ENABLED is not exactly true.",
    },
    email: {
      status: input.emailStatus,
      liveEnabled: input.emailLive,
      sending: false as const,
      detail: "The announcement function does not send email.",
    },
    payments: input.payments.map((payment) => ({
      id: payment.id,
      label: payment.label,
      status: payment.status,
      liveEnabled: payment.liveEnabled,
    })),
    privateDatabase: {
      configured: input.consentDatabaseConfigured,
      wired: false,
      detail: "Consent records are not written anywhere until a reviewed database client exists.",
    },
    mediaStorage: {
      configured: false,
      detail: "Public images publish through the review preview. Student and family photographs stay off this library.",
    },
    familyAccess: {
      open: input.familyAccessOpen,
      detail: input.familyAccessOpen ? "Family access is open." : "Family access is closed.",
    },
    guardianConsent: {
      ready: false,
      detail: "A checkbox is not guardian authority, and consent is not stored in GitHub.",
    },
    pending,
    providerLinks: PROVIDER_LINKS,
  }
}
