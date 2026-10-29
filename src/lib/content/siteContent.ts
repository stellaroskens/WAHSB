export type PageMetaContent = { title: string; description: string }

export type SiteContent = {
  version: number
  pages: Record<string, PageMetaContent>
  nav: { to: string; label: string; end: boolean }[]
  teamGearShop: { name: string; url: string; teamStoreUrl: string | null }
  seasonRegistrationClosed: {
    heading: string
    description: string
    volunteerSecondary: string
    volunteerCtaLabel: string
    volunteerCtaTo: string
  }
  sterlingVolunteerInvitationUrl: string | null
  sterlingVolunteersInfoUrl: string
  coaches: { id: string; name: string; role: string; summary: string }[]
  venues: {
    id: string
    name: string
    address: string
    phone: string
    email: string | null
    website: string
    contactUrl: string | null
  }[]
  practiceTournaments: {
    id: string
    name: string
    month: number
    day: number
    year: number | null
    startTime: string | null
    endTime: string | null
    venueId: string
    arrivalNote: string | null
  }[]
  fundraisers: {
    id: string
    business: string
    place: string
    when: string
    time: string
    image: string
    imageWidth: number
    imageHeight: number
    flyer: string
  }[]
  fundraiserContact: { name: string; email: string }
}

export type SiteContentIssue = { path: string; message: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function reqString(value: unknown, path: string, issues: SiteContentIssue[]): string {
  if (typeof value !== "string" || !value.trim()) {
    issues.push({ path, message: "Expected a non-empty string." })
    return ""
  }
  return value
}

export function validateSiteContent(input: unknown): SiteContentIssue[] {
  const issues: SiteContentIssue[] = []
  if (!isRecord(input)) {
    return [{ path: "", message: "Content must be an object." }]
  }
  if (input.version !== 1) issues.push({ path: "version", message: "version must be 1." })

  if (!isRecord(input.pages)) issues.push({ path: "pages", message: "pages is required." })
  else {
    for (const [key, page] of Object.entries(input.pages)) {
      if (!isRecord(page)) {
        issues.push({ path: `pages.${key}`, message: "Invalid page meta." })
        continue
      }
      reqString(page.title, `pages.${key}.title`, issues)
      reqString(page.description, `pages.${key}.description`, issues)
    }
  }

  if (!Array.isArray(input.nav)) issues.push({ path: "nav", message: "nav must be an array." })
  if (!isRecord(input.teamGearShop)) issues.push({ path: "teamGearShop", message: "teamGearShop is required." })
  else {
    reqString(input.teamGearShop.name, "teamGearShop.name", issues)
    reqString(input.teamGearShop.url, "teamGearShop.url", issues)
    if (input.teamGearShop.teamStoreUrl !== null && typeof input.teamGearShop.teamStoreUrl !== "string") {
      issues.push({ path: "teamGearShop.teamStoreUrl", message: "Must be string or null." })
    }
  }

  if (!Array.isArray(input.venues)) issues.push({ path: "venues", message: "venues must be an array." })
  if (!Array.isArray(input.practiceTournaments)) {
    issues.push({ path: "practiceTournaments", message: "practiceTournaments must be an array." })
  }

  if (Array.isArray(input.venues) && Array.isArray(input.practiceTournaments)) {
    const venueIds = new Set(
      input.venues
        .map((venue) => (isRecord(venue) && typeof venue.id === "string" ? venue.id : null))
        .filter((id): id is string => Boolean(id)),
    )
    input.practiceTournaments.forEach((event, index) => {
      if (!isRecord(event)) {
        issues.push({ path: `practiceTournaments[${index}]`, message: "Invalid tournament." })
        return
      }
      const venueId = event.venueId
      if (typeof venueId !== "string" || !venueIds.has(venueId)) {
        issues.push({
          path: `practiceTournaments[${index}].venueId`,
          message: `Unknown venue reference: ${String(venueId)}`,
        })
      }
      if (event.startTime == null && event.endTime != null) {
        issues.push({
          path: `practiceTournaments[${index}].startTime`,
          message: "Do not set endTime without startTime.",
        })
      }
      if (event.startTime != null && event.endTime == null) {
        issues.push({
          path: `practiceTournaments[${index}].endTime`,
          message: "Do not set startTime without endTime.",
        })
      }
    })
  }

  if (!Array.isArray(input.coaches)) issues.push({ path: "coaches", message: "coaches must be an array." })
  if (!Array.isArray(input.fundraisers)) issues.push({ path: "fundraisers", message: "fundraisers must be an array." })

  return issues
}

export function parseSiteContent(input: unknown): SiteContent {
  const issues = validateSiteContent(input)
  if (issues.length) {
    throw new Error(issues.map((issue) => `${issue.path}: ${issue.message}`).join("; "))
  }
  return input as SiteContent
}
