export type PageMetaContent = { title: string; description: string }

export type HomeCardContent = {
  heading: string
  description: string
  linkLabel: string
  linkTo: string
  imageAlt: string
}

export type TextLinkContent = { href: string; label: string }

export type PageBodies = {
  home: {
    hero: {
      imageAlt: string
      heading: string
      description: string
      buttonLabel: string
      buttonTo: string
    }
    club: {
      eyebrow: string
      headingNavy: string
      headingRed: string
      description: string
      primaryLabel: string
      primaryTo: string
      secondaryLabel: string
      secondaryTo: string
    }
    cards: HomeCardContent[]
    fundraisersHeading: string
    fundraiserLinkLabel: string
    thanks: {
      heading: string
      description: string
      directionsLabel: string
      websiteLabel: string
    }
    footerTitle: string
    footerEventLabel: string
  }
  club: {
    heroTitle: string
    coachesButtonLabel: string
    intro: string[]
    coachesHeading: string
    coachesNote: string
    administratorTitle: string
    administratorName: string
    teamSport: {
      heading: string
      paragraphs: string[]
      bullets: string[]
      lineupNote: string
      buttonLabel: string
      buttonTo: string
    }
    bakerFrames: { bowler: string; frames: string }[]
    volunteers: {
      heading: string
      paragraphs: string[]
      bullets: string[]
    }
    college: {
      heading: string
      intro: string
      bullets: string[]
      disclaimer: string
      links: TextLinkContent[]
      buttonLabel: string
      buttonTo: string
    }
    help: {
      heading: string
      description: string
      buttonLabel: string
      buttonTo: string
    }
  }
  teamGear: {
    eyebrow: string
    title: string
    heading: string
    leadBeforeShopName: string
    buttonBeforeShopName: string
    missingStorefrontNote: string
  }
  volunteer: {
    eyebrow: string
    title: string
    intro: string[]
    waysHeading: string
    waysIntro: string
    opportunities: string[]
    waysButtonLabel: string
    waysButtonTo: string
    screeningHeading: string
    screeningParagraphs: string[]
    screeningNotice: string
    screeningMissing: string
    screeningReady: string
    screeningAskLabel: string
    transportHeading: string
    transportParagraphs: string[]
    transportListIntro: string
    transportItems: string[]
    transportClosing: string
    transportButtonLabel: string
  }
}

export type PracticeLocationContent = {
  name: string
  street: string
  locality: string
  address: string
  phone: string
  phoneHref: string
  website: string
  directions: string
  logoSrc: string
  logoWidth: number
  logoHeight: number
  detail: string
}

export type SiteContent = {
  version: number
  pages: Record<string, PageMetaContent>
  nav: { to: string; label: string; end: boolean }[]
  teamGearShop: { name: string; url: string; teamStoreUrl: string | null }
  practiceLocation: PracticeLocationContent
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
  pageBodies: PageBodies
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

const REQUIRED_PAGE_KEYS = [
  "home",
  "club",
  "practices",
  "tournaments",
  "sponsors",
  "resources",
  "contact",
  "volunteer",
  "notFound",
  "bowlathon",
  "faq",
  "fundraisers",
  "teamGear",
] as const

const KNOWN_COACH_IDS = ["cliff-meredith", "chris-breshears"] as const
const MARKUP = /[<>]|javascript:/i
const INTERNAL_PATH = /^\/[A-Za-z0-9/_.#-]*$/
const HTTPS_URL = /^https:\/\/[^\s]+$/

export const CONTENT_LIMITS = {
  title: 80,
  description: 400,
  heading: 140,
  paragraph: 900,
  bio: 1500,
  label: 80,
  link: 400,
} as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function checkText(
  value: unknown,
  path: string,
  issues: SiteContentIssue[],
  max: number,
  allowEmpty = false,
) {
  if (typeof value !== "string") {
    issues.push({ path, message: "Expected text." })
    return
  }
  if (!allowEmpty && !value.trim()) issues.push({ path, message: "This field is required." })
  if (value.length > max) issues.push({ path, message: `Use ${max} characters or fewer.` })
  if (MARKUP.test(value)) issues.push({ path, message: "HTML and scripts are not allowed." })
}

function checkInternal(value: unknown, path: string, issues: SiteContentIssue[]) {
  checkText(value, path, issues, CONTENT_LIMITS.link)
  if (typeof value === "string" && value && !INTERNAL_PATH.test(value)) {
    issues.push({ path, message: "Use a site path such as /our-club." })
  }
}

function checkHttps(value: unknown, path: string, issues: SiteContentIssue[], allowNull = false) {
  if (allowNull && value === null) return
  checkText(value, path, issues, CONTENT_LIMITS.link)
  if (typeof value === "string" && value && !HTTPS_URL.test(value)) {
    issues.push({ path, message: "Use an https:// link." })
  }
}

function checkLines(value: unknown, path: string, issues: SiteContentIssue[], min: number) {
  if (!Array.isArray(value) || value.length < min) {
    issues.push({ path, message: `Add at least ${min} line${min === 1 ? "" : "s"}.` })
    return
  }
  value.forEach((line, index) => checkText(line, `${path}.${index}`, issues, CONTENT_LIMITS.paragraph))
}

export function validateSiteContent(input: unknown): SiteContentIssue[] {
  const issues: SiteContentIssue[] = []
  if (!isRecord(input)) {
    return [{ path: "", message: "Content must be an object." }]
  }
  if (input.version !== 1) issues.push({ path: "version", message: "version must be 1." })

  if (!isRecord(input.pages)) issues.push({ path: "pages", message: "pages is required." })
  else {
    for (const key of REQUIRED_PAGE_KEYS) {
      if (!isRecord(input.pages[key])) issues.push({ path: `pages.${key}`, message: "This page title is required." })
    }
    for (const [key, page] of Object.entries(input.pages)) {
      if (!isRecord(page)) {
        issues.push({ path: `pages.${key}`, message: "Invalid page meta." })
        continue
      }
      checkText(page.title, `pages.${key}.title`, issues, CONTENT_LIMITS.title)
      checkText(page.description, `pages.${key}.description`, issues, CONTENT_LIMITS.description)
    }
  }

  if (!Array.isArray(input.nav)) issues.push({ path: "nav", message: "nav must be an array." })
  else {
    input.nav.forEach((item, index) => {
      if (!isRecord(item)) {
        issues.push({ path: `nav.${index}`, message: "Invalid navigation item." })
        return
      }
      checkInternal(item.to, `nav.${index}.to`, issues)
      checkText(item.label, `nav.${index}.label`, issues, CONTENT_LIMITS.label)
      if (typeof item.end !== "boolean") issues.push({ path: `nav.${index}.end`, message: "Expected true or false." })
    })
  }

  if (!isRecord(input.teamGearShop)) issues.push({ path: "teamGearShop", message: "teamGearShop is required." })
  else {
    checkText(input.teamGearShop.name, "teamGearShop.name", issues, CONTENT_LIMITS.label)
    checkHttps(input.teamGearShop.url, "teamGearShop.url", issues)
    checkHttps(input.teamGearShop.teamStoreUrl, "teamGearShop.teamStoreUrl", issues, true)
  }

  if (!isRecord(input.seasonRegistrationClosed)) {
    issues.push({ path: "seasonRegistrationClosed", message: "Registration notice is required." })
  } else {
    const notice = input.seasonRegistrationClosed
    checkText(notice.heading, "seasonRegistrationClosed.heading", issues, CONTENT_LIMITS.heading)
    checkText(notice.description, "seasonRegistrationClosed.description", issues, CONTENT_LIMITS.paragraph)
    checkText(notice.volunteerSecondary, "seasonRegistrationClosed.volunteerSecondary", issues, CONTENT_LIMITS.paragraph)
    checkText(notice.volunteerCtaLabel, "seasonRegistrationClosed.volunteerCtaLabel", issues, CONTENT_LIMITS.label)
    checkInternal(notice.volunteerCtaTo, "seasonRegistrationClosed.volunteerCtaTo", issues)
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
  else {
    const ids = input.coaches.map((coach) => (isRecord(coach) && typeof coach.id === "string" ? coach.id : ""))
    for (const id of KNOWN_COACH_IDS) {
      if (!ids.includes(id)) issues.push({ path: "coaches", message: `Missing coach profile ${id}.` })
    }
    input.coaches.forEach((coach, index) => {
      if (!isRecord(coach)) {
        issues.push({ path: `coaches.${index}`, message: "Invalid coach profile." })
        return
      }
      if (!KNOWN_COACH_IDS.includes(coach.id as (typeof KNOWN_COACH_IDS)[number])) {
        issues.push({
          path: `coaches.${index}.id`,
          message: "Coach portraits are fixed. A new coach id needs an approved photo added by a developer.",
        })
      }
      checkText(coach.name, `coaches.${index}.name`, issues, CONTENT_LIMITS.label)
      checkText(coach.role, `coaches.${index}.role`, issues, CONTENT_LIMITS.label)
      checkText(coach.summary, `coaches.${index}.summary`, issues, CONTENT_LIMITS.bio)
    })
  }
  if (!Array.isArray(input.fundraisers)) issues.push({ path: "fundraisers", message: "fundraisers must be an array." })
  else validateFundraisers(input.fundraisers, issues)
  if (!isRecord(input.fundraiserContact)) {
    issues.push({ path: "fundraiserContact", message: "Fundraiser contact is required." })
  } else {
    checkText(input.fundraiserContact.name, "fundraiserContact.name", issues, CONTENT_LIMITS.label)
    checkText(input.fundraiserContact.email, "fundraiserContact.email", issues, CONTENT_LIMITS.label)
    if (typeof input.fundraiserContact.email === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.fundraiserContact.email)) {
      issues.push({ path: "fundraiserContact.email", message: "Use a valid email address." })
    }
  }
  if (input.sterlingVolunteerInvitationUrl !== null) {
    checkHttps(input.sterlingVolunteerInvitationUrl, "sterlingVolunteerInvitationUrl", issues)
  }
  checkHttps(input.sterlingVolunteersInfoUrl, "sterlingVolunteersInfoUrl", issues)
  if (Array.isArray(input.venues)) validateVenues(input.venues, issues)
  if (Array.isArray(input.practiceTournaments)) validateTournamentFields(input.practiceTournaments, issues)

  validatePracticeLocation(input.practiceLocation, issues)
  validatePageBodies(input.pageBodies, issues)

  return issues
}

function validatePracticeLocation(value: unknown, issues: SiteContentIssue[]) {
  if (!isRecord(value)) {
    issues.push({ path: "practiceLocation", message: "Practice location is required." })
    return
  }
  checkText(value.name, "practiceLocation.name", issues, CONTENT_LIMITS.label)
  checkText(value.street, "practiceLocation.street", issues, CONTENT_LIMITS.heading)
  checkText(value.locality, "practiceLocation.locality", issues, CONTENT_LIMITS.heading)
  checkText(value.address, "practiceLocation.address", issues, CONTENT_LIMITS.heading)
  checkText(value.phone, "practiceLocation.phone", issues, 40)
  checkText(value.phoneHref, "practiceLocation.phoneHref", issues, 40)
  if (typeof value.phoneHref === "string" && !/^tel:\+[0-9]+$/.test(value.phoneHref)) {
    issues.push({ path: "practiceLocation.phoneHref", message: "Use a tel:+ link with digits only." })
  }
  checkHttps(value.website, "practiceLocation.website", issues)
  checkHttps(value.directions, "practiceLocation.directions", issues)
  if (value.logoSrc !== "/lakeshore-lanes.avif") {
    issues.push({
      path: "practiceLocation.logoSrc",
      message: "The practice logo file stays /lakeshore-lanes.avif until a media library is configured.",
    })
  }
  if (value.logoWidth !== 324) issues.push({ path: "practiceLocation.logoWidth", message: "Logo width stays 324." })
  if (value.logoHeight !== 348) issues.push({ path: "practiceLocation.logoHeight", message: "Logo height stays 348." })
  checkText(value.detail, "practiceLocation.detail", issues, CONTENT_LIMITS.paragraph)
}

function validatePageBodies(value: unknown, issues: SiteContentIssue[]) {
  if (!isRecord(value) || !isRecord(value.home) || !isRecord(value.club) || !isRecord(value.teamGear)) {
    issues.push({ path: "pageBodies", message: "Homepage, Our Club, and Team Gear copy are required." })
    return
  }
  const home = value.home
  const hero = isRecord(home.hero) ? home.hero : null
  const clubBand = isRecord(home.club) ? home.club : null
  const thanks = isRecord(home.thanks) ? home.thanks : null
  if (!hero || !clubBand || !thanks) {
    issues.push({ path: "pageBodies.home", message: "Homepage sections are incomplete." })
  } else {
    checkText(hero.imageAlt, "pageBodies.home.hero.imageAlt", issues, CONTENT_LIMITS.label, true)
    checkText(hero.heading, "pageBodies.home.hero.heading", issues, CONTENT_LIMITS.heading)
    checkText(hero.description, "pageBodies.home.hero.description", issues, CONTENT_LIMITS.paragraph)
    checkText(hero.buttonLabel, "pageBodies.home.hero.buttonLabel", issues, CONTENT_LIMITS.label)
    checkInternal(hero.buttonTo, "pageBodies.home.hero.buttonTo", issues)
    checkText(clubBand.eyebrow, "pageBodies.home.club.eyebrow", issues, CONTENT_LIMITS.label)
    checkText(clubBand.headingNavy, "pageBodies.home.club.headingNavy", issues, CONTENT_LIMITS.heading)
    checkText(clubBand.headingRed, "pageBodies.home.club.headingRed", issues, CONTENT_LIMITS.heading)
    checkText(clubBand.description, "pageBodies.home.club.description", issues, CONTENT_LIMITS.paragraph)
    checkText(clubBand.primaryLabel, "pageBodies.home.club.primaryLabel", issues, CONTENT_LIMITS.label)
    checkInternal(clubBand.primaryTo, "pageBodies.home.club.primaryTo", issues)
    checkText(clubBand.secondaryLabel, "pageBodies.home.club.secondaryLabel", issues, CONTENT_LIMITS.label)
    checkInternal(clubBand.secondaryTo, "pageBodies.home.club.secondaryTo", issues)
    checkText(home.fundraisersHeading, "pageBodies.home.fundraisersHeading", issues, CONTENT_LIMITS.heading)
    checkText(home.fundraiserLinkLabel, "pageBodies.home.fundraiserLinkLabel", issues, CONTENT_LIMITS.label)
    checkText(thanks.heading, "pageBodies.home.thanks.heading", issues, CONTENT_LIMITS.heading)
    checkText(thanks.description, "pageBodies.home.thanks.description", issues, CONTENT_LIMITS.paragraph)
    checkText(thanks.directionsLabel, "pageBodies.home.thanks.directionsLabel", issues, CONTENT_LIMITS.label)
    checkText(thanks.websiteLabel, "pageBodies.home.thanks.websiteLabel", issues, CONTENT_LIMITS.label)
    checkText(home.footerTitle, "pageBodies.home.footerTitle", issues, CONTENT_LIMITS.heading)
    checkText(home.footerEventLabel, "pageBodies.home.footerEventLabel", issues, CONTENT_LIMITS.label)
  }
  if (!Array.isArray(home.cards) || home.cards.length !== 3) {
    issues.push({ path: "pageBodies.home.cards", message: "The homepage uses three cards. Adding a card needs a layout change." })
  } else {
    home.cards.forEach((card, index) => {
      if (!isRecord(card)) {
        issues.push({ path: `pageBodies.home.cards.${index}`, message: "Invalid card." })
        return
      }
      checkText(card.heading, `pageBodies.home.cards.${index}.heading`, issues, CONTENT_LIMITS.heading)
      checkText(card.description, `pageBodies.home.cards.${index}.description`, issues, CONTENT_LIMITS.paragraph)
      checkText(card.linkLabel, `pageBodies.home.cards.${index}.linkLabel`, issues, CONTENT_LIMITS.label)
      checkInternal(card.linkTo, `pageBodies.home.cards.${index}.linkTo`, issues)
      checkText(card.imageAlt, `pageBodies.home.cards.${index}.imageAlt`, issues, CONTENT_LIMITS.label, true)
    })
  }

  const club = value.club
  const teamSport = isRecord(club.teamSport) ? club.teamSport : null
  const volunteers = isRecord(club.volunteers) ? club.volunteers : null
  const college = isRecord(club.college) ? club.college : null
  const help = isRecord(club.help) ? club.help : null
  checkText(club.heroTitle, "pageBodies.club.heroTitle", issues, CONTENT_LIMITS.heading)
  checkText(club.coachesButtonLabel, "pageBodies.club.coachesButtonLabel", issues, CONTENT_LIMITS.label)
  checkLines(club.intro, "pageBodies.club.intro", issues, 1)
  checkText(club.coachesHeading, "pageBodies.club.coachesHeading", issues, CONTENT_LIMITS.heading)
  checkText(club.coachesNote, "pageBodies.club.coachesNote", issues, CONTENT_LIMITS.paragraph)
  checkText(club.administratorTitle, "pageBodies.club.administratorTitle", issues, CONTENT_LIMITS.label)
  checkText(club.administratorName, "pageBodies.club.administratorName", issues, CONTENT_LIMITS.label)
  if (!teamSport || !volunteers || !college || !help) {
    issues.push({ path: "pageBodies.club", message: "Our Club sections are incomplete." })
  } else {
    checkText(teamSport.heading, "pageBodies.club.teamSport.heading", issues, CONTENT_LIMITS.heading)
    checkLines(teamSport.paragraphs, "pageBodies.club.teamSport.paragraphs", issues, 1)
    checkLines(teamSport.bullets, "pageBodies.club.teamSport.bullets", issues, 1)
    checkText(teamSport.lineupNote, "pageBodies.club.teamSport.lineupNote", issues, CONTENT_LIMITS.paragraph)
    checkText(teamSport.buttonLabel, "pageBodies.club.teamSport.buttonLabel", issues, CONTENT_LIMITS.label)
    checkInternal(teamSport.buttonTo, "pageBodies.club.teamSport.buttonTo", issues)
    checkText(volunteers.heading, "pageBodies.club.volunteers.heading", issues, CONTENT_LIMITS.heading)
    checkLines(volunteers.paragraphs, "pageBodies.club.volunteers.paragraphs", issues, 1)
    checkLines(volunteers.bullets, "pageBodies.club.volunteers.bullets", issues, 1)
    checkText(college.heading, "pageBodies.club.college.heading", issues, CONTENT_LIMITS.heading)
    checkText(college.intro, "pageBodies.club.college.intro", issues, CONTENT_LIMITS.paragraph)
    checkLines(college.bullets, "pageBodies.club.college.bullets", issues, 1)
    checkText(college.disclaimer, "pageBodies.club.college.disclaimer", issues, CONTENT_LIMITS.paragraph)
    checkText(college.buttonLabel, "pageBodies.club.college.buttonLabel", issues, CONTENT_LIMITS.label)
    checkInternal(college.buttonTo, "pageBodies.club.college.buttonTo", issues)
    checkText(help.heading, "pageBodies.club.help.heading", issues, CONTENT_LIMITS.heading)
    checkText(help.description, "pageBodies.club.help.description", issues, CONTENT_LIMITS.paragraph)
    checkText(help.buttonLabel, "pageBodies.club.help.buttonLabel", issues, CONTENT_LIMITS.label)
    checkInternal(help.buttonTo, "pageBodies.club.help.buttonTo", issues)
  }
  if (!Array.isArray(club.bakerFrames) || club.bakerFrames.length !== 5) {
    issues.push({ path: "pageBodies.club.bakerFrames", message: "Baker format on this page uses five bowlers." })
  } else {
    club.bakerFrames.forEach((row, index) => {
      if (!isRecord(row)) {
        issues.push({ path: `pageBodies.club.bakerFrames.${index}`, message: "Invalid Baker row." })
        return
      }
      checkText(row.bowler, `pageBodies.club.bakerFrames.${index}.bowler`, issues, CONTENT_LIMITS.label)
      checkText(row.frames, `pageBodies.club.bakerFrames.${index}.frames`, issues, CONTENT_LIMITS.label)
    })
  }
  if (!isRecord(college) || !Array.isArray(college.links) || college.links.length !== 3) {
    issues.push({ path: "pageBodies.club.college.links", message: "College bowling keeps its three approved links." })
  } else {
    college.links.forEach((link, index) => {
      if (!isRecord(link)) {
        issues.push({ path: `pageBodies.club.college.links.${index}`, message: "Invalid link." })
        return
      }
      checkHttps(link.href, `pageBodies.club.college.links.${index}.href`, issues)
      checkText(link.label, `pageBodies.club.college.links.${index}.label`, issues, CONTENT_LIMITS.label)
    })
  }

  const gear = value.teamGear
  checkText(gear.eyebrow, "pageBodies.teamGear.eyebrow", issues, CONTENT_LIMITS.label)
  checkText(gear.title, "pageBodies.teamGear.title", issues, CONTENT_LIMITS.heading)
  checkText(gear.heading, "pageBodies.teamGear.heading", issues, CONTENT_LIMITS.heading)
  checkText(gear.leadBeforeShopName, "pageBodies.teamGear.leadBeforeShopName", issues, CONTENT_LIMITS.paragraph)
  checkText(gear.buttonBeforeShopName, "pageBodies.teamGear.buttonBeforeShopName", issues, CONTENT_LIMITS.label)
  checkText(gear.missingStorefrontNote, "pageBodies.teamGear.missingStorefrontNote", issues, CONTENT_LIMITS.paragraph)

  const volunteer = isRecord(value.volunteer) ? value.volunteer : null
  if (!volunteer) {
    issues.push({ path: "pageBodies.volunteer", message: "Volunteer page copy is required." })
  } else {
    checkText(volunteer.eyebrow, "pageBodies.volunteer.eyebrow", issues, CONTENT_LIMITS.label)
    checkText(volunteer.title, "pageBodies.volunteer.title", issues, CONTENT_LIMITS.heading)
    checkLines(volunteer.intro, "pageBodies.volunteer.intro", issues, 1)
    checkText(volunteer.waysHeading, "pageBodies.volunteer.waysHeading", issues, CONTENT_LIMITS.heading)
    checkText(volunteer.waysIntro, "pageBodies.volunteer.waysIntro", issues, CONTENT_LIMITS.paragraph)
    checkLines(volunteer.opportunities, "pageBodies.volunteer.opportunities", issues, 1)
    checkText(volunteer.waysButtonLabel, "pageBodies.volunteer.waysButtonLabel", issues, CONTENT_LIMITS.label)
    checkInternal(volunteer.waysButtonTo, "pageBodies.volunteer.waysButtonTo", issues)
    checkText(volunteer.screeningHeading, "pageBodies.volunteer.screeningHeading", issues, CONTENT_LIMITS.heading)
    checkLines(volunteer.screeningParagraphs, "pageBodies.volunteer.screeningParagraphs", issues, 1)
    checkText(volunteer.screeningNotice, "pageBodies.volunteer.screeningNotice", issues, CONTENT_LIMITS.paragraph)
    checkText(volunteer.screeningMissing, "pageBodies.volunteer.screeningMissing", issues, CONTENT_LIMITS.paragraph)
    checkText(volunteer.screeningReady, "pageBodies.volunteer.screeningReady", issues, CONTENT_LIMITS.paragraph)
    checkText(volunteer.screeningAskLabel, "pageBodies.volunteer.screeningAskLabel", issues, CONTENT_LIMITS.label)
    checkText(volunteer.transportHeading, "pageBodies.volunteer.transportHeading", issues, CONTENT_LIMITS.heading)
    checkLines(volunteer.transportParagraphs, "pageBodies.volunteer.transportParagraphs", issues, 1)
    checkText(volunteer.transportListIntro, "pageBodies.volunteer.transportListIntro", issues, CONTENT_LIMITS.paragraph)
    checkLines(volunteer.transportItems, "pageBodies.volunteer.transportItems", issues, 1)
    checkText(volunteer.transportClosing, "pageBodies.volunteer.transportClosing", issues, CONTENT_LIMITS.paragraph)
    checkText(volunteer.transportButtonLabel, "pageBodies.volunteer.transportButtonLabel", issues, CONTENT_LIMITS.label)
  }
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const CLOCK = /^([01]\d|2[0-3]):[0-5]\d$/
const PUBLIC_FILE = /^\/[A-Za-z0-9/_.-]+$/

function validateFundraisers(records: unknown[], issues: SiteContentIssue[]) {
  records.forEach((record, index) => {
    if (!isRecord(record)) {
      issues.push({ path: `fundraisers.${index}`, message: "Invalid fundraiser." })
      return
    }
    checkText(record.business, `fundraisers.${index}.business`, issues, CONTENT_LIMITS.label)
    checkText(record.place, `fundraisers.${index}.place`, issues, CONTENT_LIMITS.label)
    checkText(record.when, `fundraisers.${index}.when`, issues, CONTENT_LIMITS.heading)
    checkText(record.time, `fundraisers.${index}.time`, issues, CONTENT_LIMITS.label)
    checkText(record.id, `fundraisers.${index}.id`, issues, CONTENT_LIMITS.label)
    for (const key of ["image", "flyer"] as const) {
      const path = `fundraisers.${index}.${key}`
      checkText(record[key], path, issues, CONTENT_LIMITS.link)
      if (typeof record[key] === "string" && (!PUBLIC_FILE.test(record[key]) || !record[key].startsWith("/flyers/"))) {
        issues.push({ path, message: "Use an approved file under /flyers/." })
      }
    }
  })
}

function validateVenues(records: unknown[], issues: SiteContentIssue[]) {
  records.forEach((record, index) => {
    if (!isRecord(record)) {
      issues.push({ path: `venues.${index}`, message: "Invalid venue." })
      return
    }
    checkText(record.id, `venues.${index}.id`, issues, CONTENT_LIMITS.label)
    checkText(record.name, `venues.${index}.name`, issues, CONTENT_LIMITS.heading)
    checkText(record.address, `venues.${index}.address`, issues, CONTENT_LIMITS.heading)
    checkText(record.phone, `venues.${index}.phone`, issues, 40)
    checkHttps(record.website, `venues.${index}.website`, issues)
    if (record.email !== null) {
      checkText(record.email, `venues.${index}.email`, issues, CONTENT_LIMITS.label)
      if (typeof record.email === "string" && !EMAIL.test(record.email)) {
        issues.push({ path: `venues.${index}.email`, message: "Use a valid email address, or leave it empty." })
      }
    }
    if (record.contactUrl !== null) checkHttps(record.contactUrl, `venues.${index}.contactUrl`, issues)
  })
}

function validateTournamentFields(records: unknown[], issues: SiteContentIssue[]) {
  records.forEach((record, index) => {
    if (!isRecord(record)) return
    checkText(record.name, `practiceTournaments.${index}.name`, issues, CONTENT_LIMITS.heading)
    for (const key of ["month", "day"] as const) {
      const value = record[key]
      const max = key === "month" ? 12 : 31
      if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > max) {
        issues.push({ path: `practiceTournaments.${index}.${key}`, message: `Use a whole number from 1 to ${max}.` })
      }
    }
    if (
      record.year !== null &&
      (typeof record.year !== "number" || !Number.isInteger(record.year) || record.year < 2024 || record.year > 2035)
    ) {
      issues.push({ path: `practiceTournaments.${index}.year`, message: "Use a four-digit year, or leave it empty." })
    }
    for (const key of ["startTime", "endTime"] as const) {
      const value = record[key]
      if (value !== null && (typeof value !== "string" || !CLOCK.test(value))) {
        issues.push({ path: `practiceTournaments.${index}.${key}`, message: "Use 24-hour HH:MM, or leave both times empty." })
      }
    }
    if (record.arrivalNote !== null) {
      checkText(record.arrivalNote, `practiceTournaments.${index}.arrivalNote`, issues, CONTENT_LIMITS.paragraph)
    }
  })
}

export function parseSiteContent(input: unknown): SiteContent {
  const issues = validateSiteContent(input)
  if (issues.length) {
    throw new Error(issues.map((issue) => `${issue.path}: ${issue.message}`).join("; "))
  }
  return input as SiteContent
}
