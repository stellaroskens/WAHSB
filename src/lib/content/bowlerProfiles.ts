/**
 * Public bowler cards. Identifiable consent records do not belong in this file
 * or in the published content JSON.
 */

export const BOWLER_SILHOUETTE = "/images/bowler-silhouette.svg"
export const SAMPLE_BOWLER_ID = "sample-bowler"

export const BOWLER_STATUSES = ["draft", "pending_approval", "published", "hidden"] as const
export type BowlerPublicationStatus = (typeof BOWLER_STATUSES)[number]

export type BowlerProfile = {
  id: string
  displayName: string
  roleLabel: string
  introduction: string
  favoriteThing: string
  interests: string | null
  quote: string | null
  imagePath: string
  imageAlt: string
  publicationStatus: BowlerPublicationStatus
  hidden: boolean
  sample: boolean
  sampleApproved: boolean
}

const STATUSES = new Set<string>(BOWLER_STATUSES)
const ID = /^[a-z0-9-]{1,40}$/
const SENSITIVE = /@|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b|\b\d{3}-\d{2}-\d{4}\b/i
const FORBIDDEN_KEYS = [
  "email",
  "phone",
  "address",
  "birthDate",
  "birthdate",
  "score",
  "scores",
  "guardian",
  "guardianName",
  "consentDate",
  "studentId",
  "roster",
  "household",
]

export function visibleBowlerProfiles(profiles: readonly BowlerProfile[]): BowlerProfile[] {
  return profiles.filter((profile) => {
    if (profile.hidden || profile.publicationStatus !== "published") return false
    if (profile.sample) return profile.sampleApproved === true
    return false
  })
}

export function bowlerStatusLabel(profile: BowlerProfile): string {
  if (profile.sample && !profile.sampleApproved) return "Test / Draft"
  if (profile.hidden || profile.publicationStatus === "hidden") return "Hidden"
  if (profile.publicationStatus === "pending_approval") return "Pending approval"
  if (profile.publicationStatus === "published") return "Published"
  return "Draft"
}

function textIssue(value: unknown, max: number, allowEmpty = false): string | null {
  if (typeof value !== "string") return "Expected text."
  if (!allowEmpty && !value.trim()) return "This field is required."
  if (value.length > max) return `Use ${max} characters or fewer.`
  if (/[<>]|javascript:/i.test(value)) return "HTML and scripts are not allowed."
  if (SENSITIVE.test(value)) return "Email addresses, phone numbers, and similar private details are not allowed on a public profile."
  return null
}

export function validateBowlerProfiles(value: unknown, issues: { path: string; message: string }[]) {
  if (!Array.isArray(value)) {
    issues.push({ path: "bowlerProfiles", message: "bowlerProfiles must be an array." })
    return
  }
  if (value.length > 30) {
    issues.push({ path: "bowlerProfiles", message: "Keep this list to approved public profiles. It is not a roster." })
  }
  const ids = new Set<string>()
  value.forEach((record, index) => {
    const path = `bowlerProfiles.${index}`
    if (typeof record !== "object" || record === null || Array.isArray(record)) {
      issues.push({ path, message: "Invalid bowler profile." })
      return
    }
    const profile = record as Record<string, unknown>
    for (const key of FORBIDDEN_KEYS) {
      if (key in profile) {
        issues.push({ path: `${path}.${key}`, message: "That private field cannot be stored in public content." })
      }
    }
    if (typeof profile.id !== "string" || !ID.test(profile.id) || ids.has(profile.id)) {
      issues.push({ path: `${path}.id`, message: "Use a unique public id made of lowercase letters, numbers, and hyphens." })
    } else ids.add(profile.id)
    for (const [key, max, allowEmpty] of [
      ["displayName", 80, false],
      ["roleLabel", 80, false],
      ["introduction", 900, false],
      ["favoriteThing", 400, false],
      ["imageAlt", 140, false],
    ] as const) {
      const problem = textIssue(profile[key], max, allowEmpty)
      if (problem) issues.push({ path: `${path}.${key}`, message: problem })
    }
    for (const key of ["interests", "quote"] as const) {
      if (profile[key] === null) continue
      const problem = textIssue(profile[key], 400)
      if (problem) issues.push({ path: `${path}.${key}`, message: problem })
    }
    if (profile.imagePath !== BOWLER_SILHOUETTE) {
      issues.push({
        path: `${path}.imagePath`,
        message: "Use the generic silhouette. Student photographs stay off this file until private photograph permission exists.",
      })
    }
    if (!STATUSES.has(String(profile.publicationStatus))) {
      issues.push({ path: `${path}.publicationStatus`, message: "Use draft, pending approval, published, or hidden." })
    }
    if (typeof profile.hidden !== "boolean" || typeof profile.sample !== "boolean" || typeof profile.sampleApproved !== "boolean") {
      issues.push({ path, message: "Hidden, sample, and sample approval must be true or false." })
    }
    const showing =
      profile.hidden === false && profile.publicationStatus === "published"
    if (showing && (profile.sample !== true || profile.sampleApproved !== true)) {
      issues.push({
        path,
        message:
          "This profile cannot be published. Approve the fictional sample explicitly, or keep a real student profile unpublished until private consent is connected. A checkbox is not guardian permission.",
      })
    }
  })
}

export function blankBowlerProfile(existing: readonly BowlerProfile[]): BowlerProfile {
  let n = existing.length + 1
  let id = `bowler-${n}`
  const taken = new Set(existing.map((profile) => profile.id))
  while (taken.has(id)) {
    n += 1
    id = `bowler-${n}`
  }
  return {
    id,
    displayName: "New profile",
    roleLabel: "Team member",
    introduction: "Write an approved public introduction. Do not add contact details or scores.",
    favoriteThing: "Write an approved favorite thing about bowling.",
    interests: null,
    quote: null,
    imagePath: BOWLER_SILHOUETTE,
    imageAlt: "Generic bowler silhouette",
    publicationStatus: "draft",
    hidden: true,
    sample: false,
    sampleApproved: false,
  }
}

export function updateBowlerProfile(
  profiles: readonly BowlerProfile[],
  id: string,
  patch: Partial<BowlerProfile>,
): BowlerProfile[] {
  return profiles.map((profile) => (profile.id === id ? { ...profile, ...patch, id: profile.id, imagePath: BOWLER_SILHOUETTE } : profile))
}

export function moveBowlerProfile(profiles: readonly BowlerProfile[], id: string, direction: -1 | 1): BowlerProfile[] {
  const index = profiles.findIndex((profile) => profile.id === id)
  const nextIndex = index + direction
  if (index < 0 || nextIndex < 0 || nextIndex >= profiles.length) return [...profiles]
  const next = profiles.slice()
  const [item] = next.splice(index, 1)
  next.splice(nextIndex, 0, item)
  return next
}

export function removeBowlerProfile(profiles: readonly BowlerProfile[], id: string): BowlerProfile[] {
  return profiles.filter((profile) => profile.id !== id)
}

export function profilePublishDecision(profile: BowlerProfile): { ok: true; profile: BowlerProfile } | { ok: false; reason: string } {
  if (!profile.sample || !profile.sampleApproved) {
    return {
      ok: false,
      reason: profile.sample
        ? "The sample stays off the public page until you explicitly approve it as a fictional sample. The live site is unchanged."
        : "A real student profile cannot be published from this file. Guardian and school approval must be stored outside the public repository, and that store is not connected. A checkbox does not establish guardian authority.",
    }
  }
  return {
    ok: true,
    profile: { ...profile, publicationStatus: "published", hidden: false, imagePath: BOWLER_SILHOUETTE },
  }
}
