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

export const nav = [
  { to: "/", label: "Home", end: true },
  { to: "/our-club", label: "Our Club", end: false },
  { to: "/practices", label: "Practices", end: false },
  { to: "/tournaments", label: "Tournaments", end: false },
  { to: "/team-gear", label: "Team Gear", end: false },
  { to: "/sponsors", label: "Sponsors", end: false },
  { to: "/fundraisers", label: "Fundraisers", end: false },
  { to: "/resources", label: "Bowling Resources", end: false },
  { to: "/volunteer", label: "Volunteer Opportunities", end: false },
  { to: "/faq", label: "FAQ", end: false },
  { to: "/contact", label: "Contact Us", end: false },
] as const

/** Public capacity notice for student participation. */
export const studentCapacityNotice =
  "The Albany High School Bowling Club is currently at capacity and is not accepting additional student participants at this time."

/**
 * Organization-specific Sterling Volunteers invitation URL for starting a volunteer background check.
 * Leave null until the club provides the official invitation link.
 * Do not invent an organization ID, invitation code, or package URL.
 */
export const sterlingVolunteerInvitationUrl: string | null = null

/** Informational Sterling Volunteers page. This is not an organization invitation. */
export const sterlingVolunteersInfoUrl =
  "https://www.sterlingvolunteers.com/getavolunteerbackgroundcheck/" as const

export const pages = {
  home: {
    title: "Albany High School Bowling",
    description:
      "Albany High School Bowling in Albany, Oregon. Support our athletes through volunteering, fundraising, and community events with South Albany, West Albany, and Lebanon.",
  },
  club: {
    title: "Our Club | Albany High School Bowling",
    description:
      "Albany High School Bowling teaches skills, confidence, teamwork, and sportsmanship. Read about the club and coaches Cliff Meredith and Chris Breshears.",
  },
  practices: {
    title: "Practices | Albany High School Bowling",
    description:
      "Practice information for Albany High School Bowling, including the host center at Lakeshore Lanes and where the schedule will be posted.",
  },
  tournaments: {
    title: "Tournaments | Albany High School Bowling",
    description:
      "Practice tournament dates, venues, and directions for Albany High School Bowling. The 2026–2027 dates are listed. Start times are not confirmed yet.",
  },
  sponsors: {
    title: "Sponsors | Albany High School Bowling",
    description:
      "Support Albany High School Bowling or preview how a family could look up a bowler. This preview does not take payment.",
  },
  resources: {
    title: "Bowling Resources | Albany High School Bowling",
    description:
      "A curated place for local bowling services, suggested equipment, and learning links for Albany High School Bowling.",
  },
  contact: {
    title: "Contact Us | Albany High School Bowling",
    description:
      "Contact Albany High School Bowling about volunteering, practices, or supporting our athletes. The preview form on this page does not send a message.",
  },
  volunteer: {
    title: "Volunteer Opportunities | Albany High School Bowling",
    description:
      "Adult volunteer opportunities for Albany High School Bowling, including background checks through Sterling Volunteers and help with transportation.",
  },
  notFound: {
    title: "Page not found | Albany High School Bowling",
    description: "That page is not part of the Albany High School Bowling site.",
  },
  bowlathon: {
    title: "Bowl-a-thon | Albany High School Bowling",
    description:
      "Preview a Bowl-a-thon pledge for Albany High School Bowling. This form does not send, save, or collect a pledge.",
  },
  faq: {
    title: "Frequently Asked Questions | Albany High School Bowling",
    description:
      "Answers about the Bowl-A-Thon, practices, equipment, bowling basics, and tournament etiquette for Albany High School Bowling.",
  },
  fundraisers: {
    title: "Fundraisers | Albany High School Bowling",
    description:
      "Upcoming Albany High School Bowling fundraisers at Panda Express and Burgerville, including dates, times, and how to participate.",
  },
  teamGear: {
    title: "Team Gear | Albany High School Bowling",
    description:
      "We're moving our Albany High School Bowling team gear shopping experience to BSN SPORTS.",
  },
} as const

/**
 * Team gear is sold by BSN SPORTS, not on this site.
 * Leave teamStoreUrl null until the club provides the dedicated team store link. Do not guess one.
 */
export const teamGearShop: { name: string; url: string; teamStoreUrl: string | null } = {
  name: "BSN SPORTS",
  url: "https://www.bsnsports.com/",
  teamStoreUrl: null,
}

/** Confirmed Bowl-a-thon date only. Leave null until the club publishes one. */
export const bowlathonEvent: { date: string | null } = {
  date: null,
}

export const coaches = [
  {
    id: "cliff-meredith",
    name: "Cliff Meredith",
    role: "Coach",
    summary:
      "Cliff Meredith is a member of the Mid-Valley USBC Hall of Fame. He bowled in college for Linn-Benton Community College and Oregon State University, including USBC sectional competition, and he coached the Central Oregon Community College team while working at Sun Mountain Lanes. He has led youth programs in the Albany area, coached South Albany High School bowling for three years, and served eight years as the Oregon State USBC high school manager. He has also worked with the University of Oregon and Oregon State University on their college bowling programs. He is a USBC registered volunteer and has completed SafeSport certification. He wants bowling to feel welcoming both for athletes who compete and for those who bowl because they enjoy it.",
  },
  {
    id: "chris-breshears",
    name: "Chris Breshears",
    role: "Coach",
    summary:
      "Chris Breshears is from Albany and has been bowling since 1994, starting in the youth program at B & D Bowl. He has competed across the country, bowled for West Albany High School, and in 1998 helped restart the high school program while he was still a bowler. After graduation he coached the boys’ and girls’ teams for several years and coached youth leagues in the Albany area. He is certified in bowling ball drilling and fitting. His focus is giving back to young bowlers in the community.",
  },
] as const

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

export const venues = [
  {
    id: "starlite-lanes",
    name: "Starlite Lanes",
    address: "394 Main Street, Dallas, OR 97338",
    phone: "503-623-4267",
    email: "manager.starlitelanes@gmail.com",
    website: "https://www.facebook.com/starlitelanes/",
    contactUrl: null,
  },
  {
    id: "northgate-bowl",
    name: "Northgate Bowl",
    address: "2380 Northgate Avenue NE, Salem, OR 97301",
    phone: "503-581-1634",
    email: null,
    website: "https://www.northgatebowl.com/",
    contactUrl: null,
  },
  {
    id: "cottage-bowl",
    name: "The Cottage Bowl",
    address: "740 Row River Road, Cottage Grove, OR 97424",
    phone: "541-767-2695",
    email: null,
    website: "https://thecottagebowl.com/",
    contactUrl: null,
  },
  {
    id: "silver-creek-lanes",
    name: "Silver Creek Lanes",
    address: "500 West C Street, Silverton, OR 97381",
    phone: "503-873-5316",
    email: null,
    website: "https://www.silvercreeklanes.com/",
    contactUrl: "https://www.silvercreeklanes.com/contact-scl",
  },
  {
    id: "firs-bowl-lanes",
    name: "Firs Bowl Lanes",
    address: "1950 River Road, Eugene, OR 97404",
    phone: "541-688-1558",
    email: "firsbowllanes@gmail.com",
    website: "https://www.firsbowllanes.net/",
    contactUrl: null,
  },
] as const

export type Venue = (typeof venues)[number]

/**
 * Practice tournaments for the confirmed 2026–2027 season.
 * November and December are 2026. January is 2027.
 * Leave startTime and endTime null until both are known. Do not invent a start time or a duration.
 * arrivalNote is only for arrival details the club has confirmed for that event.
 */
export const practiceTournaments: {
  id: string
  name: string
  month: number
  day: number
  year: number | null
  startTime: string | null
  endTime: string | null
  venueId: Venue["id"]
  arrivalNote: string | null
}[] = [
  {
    id: "practice-1115",
    name: "Practice tournament",
    month: 11,
    day: 15,
    year: 2026,
    startTime: null,
    endTime: null,
    venueId: "starlite-lanes",
    arrivalNote: null,
  },
  {
    id: "practice-1205",
    name: "Practice tournament",
    month: 12,
    day: 5,
    year: 2026,
    startTime: null,
    endTime: null,
    venueId: "northgate-bowl",
    arrivalNote: null,
  },
  {
    id: "practice-0102",
    name: "Practice tournament",
    month: 1,
    day: 2,
    year: 2027,
    startTime: null,
    endTime: null,
    venueId: "cottage-bowl",
    arrivalNote: null,
  },
  {
    id: "practice-0103",
    name: "Practice tournament",
    month: 1,
    day: 3,
    year: 2027,
    startTime: null,
    endTime: null,
    venueId: "silver-creek-lanes",
    arrivalNote: null,
  },
  {
    id: "practice-0117",
    name: "Practice tournament",
    month: 1,
    day: 17,
    year: 2027,
    startTime: null,
    endTime: null,
    venueId: "firs-bowl-lanes",
    arrivalNote: null,
  },
]

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
