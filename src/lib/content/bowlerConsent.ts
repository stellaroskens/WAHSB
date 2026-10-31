/**
 * Consent decisions for bowler profiles.
 * These records are identifiable when joined to a student and must never be
 * written to GitHub, siteContent.json, or a public draft.
 * A checkbox in the browser does not establish legal guardian authority.
 */

export const CONSENT_STORE_SETUP = [
  "Provision Netlify Database for this site. Do not store consent records in GitHub, in the published content file, or in a public draft.",
  "Keep the database connection as a Netlify function secret. Do not paste it into the browser, chat, or this repository.",
  "This site does not save a consent form until that private store is connected and a reviewed database client writes only there.",
  "A checkbox, including one labeled guardian permission, does not by itself establish legal guardian authority.",
] as const

export const CONSENT_NOT_SAVED =
  "The private consent store is not connected. Nothing was saved, and the profile was not published."

const APPROVED_FIELDS = ["displayName", "introduction", "favoriteThing", "interests", "quote", "photograph"] as const
const GUARDIAN = ["not_recorded", "documented", "withdrawn", "expired"] as const
const SCHOOL = ["not_recorded", "documented", "not_required", "withdrawn"] as const
const PHOTO = ["not_recorded", "approved", "withdrawn"] as const
const WITHDRAWAL = ["none", "withdrawn"] as const

export type BowlerConsentRecord = {
  profileId: string
  guardianPermission: (typeof GUARDIAN)[number]
  clubSchoolApproval: (typeof SCHOOL)[number]
  approvedFields: string[]
  photographPermission: (typeof PHOTO)[number]
  consentDate: string | null
  withdrawalStatus: (typeof WITHDRAWAL)[number]
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
}

export function readConsentRecord(input: unknown): { ok: true; record: BowlerConsentRecord } | { ok: false; reason: string } {
  if (typeof input !== "object" || input === null) return { ok: false, reason: "Consent record is incomplete." }
  const record = input as Record<string, unknown>
  for (const key of ["guardianName", "guardianEmail", "email", "phone", "address", "studentName", "birthDate"]) {
    if (key in record) return { ok: false, reason: "Do not include a name, email, phone, address, or birth date in this record." }
  }
  if (typeof record.profileId !== "string" || !/^[a-z0-9-]{1,40}$/.test(record.profileId)) {
    return { ok: false, reason: "Choose a profile already in the editor." }
  }
  if (!oneOf(record.guardianPermission, GUARDIAN)) return { ok: false, reason: "Choose a guardian permission status." }
  if (!oneOf(record.clubSchoolApproval, SCHOOL)) return { ok: false, reason: "Choose a club or school approval status." }
  if (!oneOf(record.photographPermission, PHOTO)) return { ok: false, reason: "Choose a photograph permission status." }
  if (!oneOf(record.withdrawalStatus, WITHDRAWAL)) return { ok: false, reason: "Choose a withdrawal status." }
  if (!Array.isArray(record.approvedFields) || record.approvedFields.some((field) => typeof field !== "string")) {
    return { ok: false, reason: "List the approved public fields." }
  }
  if (record.approvedFields.some((field) => !(APPROVED_FIELDS as readonly string[]).includes(field))) {
    return { ok: false, reason: "Approved fields can only be the public profile fields." }
  }
  if (record.consentDate !== null && (typeof record.consentDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(record.consentDate))) {
    return { ok: false, reason: "Use a consent date as YYYY-MM-DD, or leave it empty." }
  }
  return { ok: true, record: record as BowlerConsentRecord }
}

function expired(date: string | null, now: Date): boolean {
  if (!date) return false
  const consent = new Date(`${date}T00:00:00Z`)
  if (Number.isNaN(consent.getTime())) return true
  const limit = new Date(consent)
  limit.setUTCFullYear(limit.getUTCFullYear() + 1)
  return now.getTime() >= limit.getTime()
}

/**
 * Whether a private consent record would allow a future publish.
 * This does not publish anything and does not store the record.
 */
export function consentAllowsPublication(
  record: BowlerConsentRecord,
  now = new Date(),
): { ok: true } | { ok: false; reason: string } {
  if (
    record.withdrawalStatus === "withdrawn" ||
    record.guardianPermission === "withdrawn" ||
    record.photographPermission === "withdrawn" ||
    record.clubSchoolApproval === "withdrawn"
  ) {
    return {
      ok: false,
      reason: "Withdrawn permission blocks publishing and requires the public profile and image to come off the site.",
    }
  }
  if (record.guardianPermission === "expired" || expired(record.consentDate, now)) {
    return { ok: false, reason: "Expired permission blocks publishing until a new approval is recorded privately." }
  }
  if (record.guardianPermission !== "documented") {
    return { ok: false, reason: "Guardian permission is not documented. A checkbox does not establish legal guardian authority." }
  }
  if (record.clubSchoolApproval !== "documented" && record.clubSchoolApproval !== "not_required") {
    return { ok: false, reason: "Club or school approval is not recorded." }
  }
  if (record.photographPermission !== "approved") {
    return { ok: false, reason: "Photograph permission is not approved. The public card keeps the generic silhouette." }
  }
  if (!record.consentDate) return { ok: false, reason: "A consent date is required in the private record." }
  for (const field of ["displayName", "introduction", "favoriteThing", "photograph"]) {
    if (!record.approvedFields.includes(field)) {
      return { ok: false, reason: `The private record must list ${field} as an approved public field.` }
    }
  }
  return { ok: true }
}
