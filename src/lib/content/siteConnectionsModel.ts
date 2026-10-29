export type ConnectionStatus = "disabled" | "prepared" | "verified"

export type SocialNetworkId = "facebook" | "instagram" | "youtube" | "tiktok"
export type PaymentProviderId = "stripe" | "paypal" | "venmo" | "cash_app"

export type SocialConnection = {
  id: SocialNetworkId
  label: string
  publicUrl: string | null
  status: ConnectionStatus
  liveEnabled: boolean
  staffNote: string | null
}

export type PaymentConnection = {
  id: PaymentProviderId
  label: string
  /** Public checkout URL, profile URL, or @handle — never a password or API secret. */
  publicDestination: string | null
  status: ConnectionStatus
  liveEnabled: boolean
  staffNote: string | null
}

export type EmailConnection = {
  providerLabel: string | null
  publicFromAddress: string | null
  status: ConnectionStatus
  liveEnabled: boolean
  staffNote: string | null
}

export type SiteConnectionsConfig = {
  version: number
  social: SocialConnection[]
  email: EmailConnection
  payments: PaymentConnection[]
  sharing: {
    publicWebsiteUrl: string | null
    publicFundraiserUrl: string | null
    publicSponsorshipUrl: string | null
  }
}

export type ConnectionsIssue = { path: string; message: string }

const SOCIAL_IDS: SocialNetworkId[] = ["facebook", "instagram", "youtube", "tiktok"]
const PAYMENT_IDS: PaymentProviderId[] = ["stripe", "paypal", "venmo", "cash_app"]
const STATUSES: ConnectionStatus[] = ["disabled", "prepared", "verified"]

/** Reject values that look like secrets — connections may only store public destinations. */
export function looksLikeSecret(value: string): boolean {
  const lower = value.toLowerCase()
  return (
    /sk_live|sk_test|rk_live|rk_test|whsec_/.test(lower) ||
    /password\s*[:=]/.test(lower) ||
    /api[_-]?key\s*[:=]/.test(lower) ||
    /client[_-]?secret/.test(lower) ||
    /bearer\s+[a-z0-9._-]+/i.test(value) ||
    /-----begin/.test(lower)
  )
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

/** Allow https URLs or simple @handles for Venmo/Cash App style destinations. */
export function approvedPublicDestination(value: string | null): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed || looksLikeSecret(trimmed)) return null
  if (trimmed.startsWith("@") && /^@[A-Za-z0-9._-]{2,40}$/.test(trimmed)) return trimmed
  return approvedPublicHttps(trimmed)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function asStatus(value: unknown, path: string, issues: ConnectionsIssue[]): ConnectionStatus {
  if (typeof value === "string" && (STATUSES as string[]).includes(value)) {
    return value as ConnectionStatus
  }
  issues.push({ path, message: "status must be disabled, prepared, or verified." })
  return "disabled"
}

export function validateSiteConnections(input: unknown): ConnectionsIssue[] {
  const issues: ConnectionsIssue[] = []
  if (!isRecord(input)) return [{ path: "", message: "Connections config must be an object." }]
  if (input.version !== 1) issues.push({ path: "version", message: "version must be 1." })

  if (!Array.isArray(input.social)) issues.push({ path: "social", message: "social must be an array." })
  else {
    const seen = new Set<string>()
    input.social.forEach((item, index) => {
      if (!isRecord(item)) {
        issues.push({ path: `social[${index}]`, message: "Invalid social entry." })
        return
      }
      if (typeof item.id !== "string" || !(SOCIAL_IDS as string[]).includes(item.id)) {
        issues.push({ path: `social[${index}].id`, message: "Unknown social network id." })
      } else if (seen.has(item.id)) {
        issues.push({ path: `social[${index}].id`, message: "Duplicate social network id." })
      } else seen.add(item.id)

      const status = asStatus(item.status, `social[${index}].status`, issues)
      if (item.liveEnabled === true && status !== "verified") {
        issues.push({
          path: `social[${index}].liveEnabled`,
          message: "liveEnabled requires status verified.",
        })
      }
      if (typeof item.publicUrl === "string") {
        if (looksLikeSecret(item.publicUrl)) {
          issues.push({ path: `social[${index}].publicUrl`, message: "Secrets are not allowed." })
        } else if (item.publicUrl && !approvedPublicHttps(item.publicUrl)) {
          issues.push({ path: `social[${index}].publicUrl`, message: "Must be a public https URL." })
        }
      } else if (item.publicUrl !== null) {
        issues.push({ path: `social[${index}].publicUrl`, message: "Must be string or null." })
      }
    })
  }

  if (!isRecord(input.email)) issues.push({ path: "email", message: "email is required." })
  else {
    const status = asStatus(input.email.status, "email.status", issues)
    if (input.email.liveEnabled === true && status !== "verified") {
      issues.push({ path: "email.liveEnabled", message: "liveEnabled requires status verified." })
    }
    if (typeof input.email.publicFromAddress === "string" && looksLikeSecret(input.email.publicFromAddress)) {
      issues.push({ path: "email.publicFromAddress", message: "Secrets are not allowed." })
    }
  }

  if (!isRecord(input.sharing)) issues.push({ path: "sharing", message: "sharing is required." })
  else {
    for (const key of ["publicWebsiteUrl", "publicFundraiserUrl", "publicSponsorshipUrl"] as const) {
      const value = input.sharing[key]
      if (typeof value === "string") {
        if (looksLikeSecret(value)) {
          issues.push({ path: `sharing.${key}`, message: "Secrets are not allowed." })
        } else if (value && !approvedPublicHttps(value)) {
          issues.push({ path: `sharing.${key}`, message: "Must be a public https URL." })
        }
      } else if (value !== null && value !== undefined) {
        issues.push({ path: `sharing.${key}`, message: "Must be string or null." })
      }
    }
  }

  if (!Array.isArray(input.payments)) issues.push({ path: "payments", message: "payments must be an array." })
  else {
    const seen = new Set<string>()
    input.payments.forEach((item, index) => {
      if (!isRecord(item)) {
        issues.push({ path: `payments[${index}]`, message: "Invalid payment entry." })
        return
      }
      if (typeof item.id !== "string" || !(PAYMENT_IDS as string[]).includes(item.id)) {
        issues.push({ path: `payments[${index}].id`, message: "Unknown payment provider id." })
      } else if (seen.has(item.id)) {
        issues.push({ path: `payments[${index}].id`, message: "Duplicate payment provider id." })
      } else seen.add(item.id)

      const status = asStatus(item.status, `payments[${index}].status`, issues)
      if (item.liveEnabled === true && status !== "verified") {
        issues.push({
          path: `payments[${index}].liveEnabled`,
          message: "Payment destinations stay disabled until verified and approved.",
        })
      }
      if (typeof item.publicDestination === "string") {
        if (looksLikeSecret(item.publicDestination)) {
          issues.push({
            path: `payments[${index}].publicDestination`,
            message: "Passwords and API secrets are not allowed.",
          })
        } else if (item.publicDestination && !approvedPublicDestination(item.publicDestination)) {
          issues.push({
            path: `payments[${index}].publicDestination`,
            message: "Use a public https URL or @handle only.",
          })
        }
      } else if (item.publicDestination !== null) {
        issues.push({ path: `payments[${index}].publicDestination`, message: "Must be string or null." })
      }
    })
  }

  return issues
}

export function parseSiteConnections(input: unknown): SiteConnectionsConfig {
  const issues = validateSiteConnections(input)
  if (issues.length) {
    throw new Error(issues.map((issue) => `${issue.path}: ${issue.message}`).join("; "))
  }
  return input as SiteConnectionsConfig
}

/** Live payment options only after super_admin verification — never treat prepared as live. */
export function livePaymentDestinations(config: SiteConnectionsConfig): PaymentConnection[] {
  return config.payments.filter((item) => item.liveEnabled && item.status === "verified")
}

export function anyPaymentsLive(config: SiteConnectionsConfig): boolean {
  return livePaymentDestinations(config).length > 0
}
