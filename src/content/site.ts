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

/** Confirmed Bowl-a-thon date only. Leave null until the club publishes one. */
export const bowlathonEvent: { date: string | null } = {
  date: null,
}

export const practiceLocation = {
  name: "Lakeshore Lanes",
  street: "5432 Pacific Blvd SW",
  locality: "Albany, OR 97321",
  address: "5432 Pacific Blvd SW, Albany, OR 97321",
  phone: "(541) 926-4631",
  phoneHref: "tel:+15419264631",
  website: "https://www.lakeshorelanesonline.com/",
  directions:
    "https://www.google.com/maps/dir/?api=1&destination=5432%20Pacific%20Blvd%20SW%2C%20Albany%2C%20OR%2097321",
  logoSrc: "/lakeshore-lanes.avif",
  logoWidth: 324,
  logoHeight: 348,
  detail: "Days and times are not posted yet. Lane access is arranged with the center.",
} as const

export const tournamentEvents = [
  {
    id: "district-finals",
    name: "District finals",
    detail:
      "Date not confirmed. The previous club site placed district finals at the end of January.",
    confirmed: false,
  },
  {
    id: "state-finals",
    name: "State finals",
    detail:
      "Teams must qualify. Date not confirmed. The previous club site placed the state tournament at the end of February.",
    confirmed: false,
  },
  {
    id: "all-stars",
    name: "All-Stars",
    detail: "Teams must qualify. Date not confirmed.",
    confirmed: false,
  },
] as const

export const bakerFrames = [
  { bowler: "Bowler 1", frames: "Frames 1 and 6" },
  { bowler: "Bowler 2", frames: "Frames 2 and 7" },
  { bowler: "Bowler 3", frames: "Frames 3 and 8" },
  { bowler: "Bowler 4", frames: "Frames 4 and 9" },
  { bowler: "Bowler 5", frames: "Frames 5 and 10" },
] as const

export const arrival = [
  { label: "Arrive", value: "8:00 a.m." },
  { label: "Check-in", value: "8:30 a.m." },
  { label: "Bowling starts", value: "9:00 a.m." },
] as const

export const attire = [
  "Athletes wear the approved uniform. The top is the provided jersey.",
  "The bottom is black dress pants, or black dress shorts with an inner seam of at least six inches.",
  "Black skirts are allowed if they are not a tennis style and the length is appropriate.",
  "No jeans. No leggings, except under skirts. No undergarments showing.",
  "No holes, patches, or frayed hems.",
  "No hats.",
] as const

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

export const localServiceCategories = [
  "Ball fitting",
  "Drilling",
  "Redrilling",
  "Repairs",
  "Equipment orders",
  "Shoes",
] as const

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
