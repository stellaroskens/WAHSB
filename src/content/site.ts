import publishedSiteContent from "./published/siteContent.json"
import { parseSiteContent } from "../lib/content/siteContent.ts"

/** Published editable content (drafts never auto-apply). */
export const siteContent = parseSiteContent(publishedSiteContent)

export const club = {
  name: "Albany High School Bowling",
  place: "Albany, Oregon",
  email: "albanyhsbowling@gmail.com",
  social: [
    {
      label: "Facebook",
      href: "https://www.facebook.com/Albany-HS-Bowling-100535069272298",
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/ahsbowling",
    },
  ],
  schools: [
    { name: "South Albany", prominence: "primary" },
    { name: "West Albany", prominence: "primary" },
    { name: "Lebanon", prominence: "secondary" },
  ],
} as const

export const nav = siteContent.nav
export const pages = siteContent.pages
export const pageBodies = siteContent.pageBodies
export const bowlerProfiles = siteContent.bowlerProfiles
export const bowlerResults = siteContent.bowlerResults
export const bowlerHonors = siteContent.bowlerHonors
export const seasonRegistrationClosed = siteContent.seasonRegistrationClosed
/** @deprecated Prefer seasonRegistrationClosed.description for new copy. */
export const studentCapacityNotice = seasonRegistrationClosed.description
export const sterlingVolunteerInvitationUrl = siteContent.sterlingVolunteerInvitationUrl
export const sterlingVolunteersInfoUrl = siteContent.sterlingVolunteersInfoUrl
export const teamGearShop = siteContent.teamGearShop

/** Portrait keys in media.ts — keep in sync when adding coaches. */
export type CoachId = "cliff-meredith" | "chris-breshears"

export const coaches = siteContent.coaches.map((coach) => ({
  ...coach,
  id: coach.id as CoachId,
}))
export const venues = siteContent.venues
export type Venue = (typeof venues)[number]
export const practiceTournaments = siteContent.practiceTournaments
export const library = siteContent.library

/** Confirmed Bowl-a-thon date only. Leave null until the club publishes one. */
export const bowlathonEvent: { date: string | null } = {
  date: null,
}

export const practiceLocation = siteContent.practiceLocation
export const tournamentEvents = library.tournaments.events
export const bakerFrames = pageBodies.club.bakerFrames
export const arrival = library.tournaments.arrival
export const attire = library.tournaments.attire

export type ResourceCategory = "local" | "equipment" | "learning"

export type ResourceLink = {
  id: string
  title: string
  description: string
  href?: string
  category: ResourceCategory
  services?: string[]
  approved: boolean
}

/**
 * Public resources only. Add an entry after the club approves the wording,
 * the business, and the link. The page hides anything with approved: false
 * so an unapproved draft does not appear in the layout.
 */
export const resources: ResourceLink[] = []

export const localServiceCategories = library.resources.serviceTags

export type BusinessSponsor = {
  id: string
  name: string
  detail?: string
  href?: string
  /** Local approved artwork only, such as `/sponsors/example.png`. Do not use a remote logo URL. */
  logoSrc?: string
  logoAlt?: string
  approved: boolean
}

/** Approved sponsors only. Do not add a business until the club has agreed to list it. */
export const businessSponsors: BusinessSponsor[] = []
