/**
 * Public bowler cards. Consent records, birth dates, and student photographs
 * do not belong in this file or in the published content JSON.
 */

import { AHSB_LOGO, SCHOOLS, SCHOOL_IDS, schoolLogo, type LogoStyle, type SchoolId } from "./schoolLogos.ts"

export const BOWLER_STATUSES = ["draft", "pending_approval", "published", "hidden", "archived"] as const
export type BowlerPublicationStatus = (typeof BOWLER_STATUSES)[number]
export type PhotoVisibility = "unavailable" | "hidden"

export type BowlerProfile = {
  id: string
  displayName: string
  school: SchoolId | null
  logoStyle: LogoStyle | null
  yearsBowling: number | null
  grade: string | null
  age: number | null
  introduction: string | null
  photoVisibility: PhotoVisibility
  publicationStatus: BowlerPublicationStatus
  hidden: boolean
  placeholder: boolean
  sample: boolean
  sampleApproved: boolean
  guardianApproved: boolean
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
  "guardian",
  "guardianName",
  "consentDate",
  "studentId",
  "roster",
  "household",
  "imageData",
  "image",
  "imagePath",
  "photo",
  "photoPath",
]

export function isPublicBowler(profile: BowlerProfile): boolean {
  if (profile.hidden || profile.publicationStatus === "archived" || profile.publicationStatus === "hidden") return false
  if (profile.publicationStatus !== "published") return false
  if (profile.placeholder) return true
  if (profile.sample) return profile.sampleApproved === true
  return false
}

export function visibleBowlerProfiles(profiles: readonly BowlerProfile[]): BowlerProfile[] {
  return profiles.filter(isPublicBowler)
}

export function bowlerById(profiles: readonly BowlerProfile[], id: string): BowlerProfile | undefined {
  return profiles.find((profile) => profile.id === id)
}

export function bowlerStatusLabel(profile: BowlerProfile): string {
  if (!profile.placeholder && !profile.sample && profile.publicationStatus === "draft") return "Draft"
  if (profile.publicationStatus === "pending_approval") return "Awaiting approval"
  if (profile.publicationStatus === "archived") return "Archived"
  if (profile.hidden || profile.publicationStatus === "hidden") return "Hidden"
  if (profile.publicationStatus === "published" && profile.placeholder) return "Placeholder"
  if (profile.publicationStatus === "published") return "Published"
  return "Draft"
}

/** One image only: the selected school logo, or the AHSB logo when no school is set. Never a student photo. */
export function publicBowlerArtwork(profile: BowlerProfile): { src: string; alt: string } {
  if (profile.school && profile.logoStyle) return schoolLogo(profile.school, profile.logoStyle)
  return { src: AHSB_LOGO, alt: "AHSB logo" }
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
  if (value.length > 40) {
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
      if (key in profile) issues.push({ path: `${path}.${key}`, message: "That private field cannot be stored in public content." })
    }
    if (typeof profile.id !== "string" || !ID.test(profile.id) || ids.has(profile.id)) {
      issues.push({ path: `${path}.id`, message: "Use a unique public id made of lowercase letters, numbers, and hyphens." })
    } else ids.add(profile.id)
    const name = textIssue(profile.displayName, 80)
    if (name) issues.push({ path: `${path}.displayName`, message: name })
    if (profile.introduction !== null) {
      const intro = textIssue(profile.introduction, 900)
      if (intro) issues.push({ path: `${path}.introduction`, message: intro })
    }
    if (profile.grade !== null) {
      const grade = textIssue(profile.grade, 40)
      if (grade) issues.push({ path: `${path}.grade`, message: grade })
    }
    if (profile.school !== null && !SCHOOL_IDS.includes(profile.school as SchoolId)) {
      issues.push({ path: `${path}.school`, message: "Choose South Albany, West Albany, or Lebanon." })
    }
    if (profile.school === null && profile.logoStyle !== null) {
      issues.push({ path: `${path}.logoStyle`, message: "Choose a school before choosing a logo." })
    }
    if (profile.school !== null && profile.logoStyle !== "full" && profile.logoStyle !== "mark") {
      issues.push({ path: `${path}.logoStyle`, message: "Choose either the full school logo or the simplified mark, not both." })
    }
    if (profile.age !== null && (typeof profile.age !== "number" || !Number.isInteger(profile.age) || profile.age < 10 || profile.age > 19)) {
      issues.push({ path: `${path}.age`, message: "Age must be a whole number from 10 to 19, or empty. Do not store a birth date." })
    }
    if (
      profile.yearsBowling !== null &&
      (typeof profile.yearsBowling !== "number" || !Number.isInteger(profile.yearsBowling) || profile.yearsBowling < 0 || profile.yearsBowling > 12)
    ) {
      issues.push({ path: `${path}.yearsBowling`, message: "Years bowling must be a whole number from 0 to 12, or empty." })
    }
    if (profile.photoVisibility !== "unavailable" && profile.photoVisibility !== "hidden") {
      issues.push({ path: `${path}.photoVisibility`, message: "A player photo is unavailable or hidden. Student photos are not stored in this file." })
    }
    if (!STATUSES.has(String(profile.publicationStatus))) {
      issues.push({ path: `${path}.publicationStatus`, message: "Use draft, pending approval, published, hidden, or archived." })
    }
    if (profile.guardianApproved !== false) {
      issues.push({
        path: `${path}.guardianApproved`,
        message: "Guardian approval cannot be marked in the public content file. A checkbox is not guardian permission.",
      })
    }
    const showing = profile.hidden === false && profile.publicationStatus === "published"
    const allowedPublic = profile.placeholder === true || (profile.sample === true && profile.sampleApproved === true)
    if (showing && !allowedPublic) {
      issues.push({
        path,
        message:
          "A real student profile cannot be published from this file until private guardian and club approval are connected. A checkbox is not guardian permission.",
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
    school: null,
    logoStyle: null,
    yearsBowling: null,
    grade: null,
    age: null,
    introduction: null,
    photoVisibility: "unavailable",
    publicationStatus: "draft",
    hidden: true,
    placeholder: false,
    sample: false,
    sampleApproved: false,
    guardianApproved: false,
  }
}

export function updateBowlerProfile(
  profiles: readonly BowlerProfile[],
  id: string,
  patch: Partial<BowlerProfile>,
): BowlerProfile[] {
  return profiles.map((profile) =>
    profile.id === id ? { ...profile, ...patch, id: profile.id, guardianApproved: false } : profile,
  )
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
  if (profile.placeholder) {
    return { ok: true, profile: { ...profile, publicationStatus: "published", hidden: false, guardianApproved: false } }
  }
  if (profile.sample && profile.sampleApproved) {
    return { ok: true, profile: { ...profile, publicationStatus: "published", hidden: false, guardianApproved: false } }
  }
  return {
    ok: false,
    reason:
      "This profile stays unpublished. A real student needs private guardian and club approval, which is not connected. A checkbox does not make the profile family-approved.",
  }
}

export function schoolLabel(school: SchoolId | null): string | null {
  return school ? SCHOOLS[school].label : null
}
