import { pages } from "./site"

export type SearchEntry = { to: string; label: string; detail: string; keywords: string }

const publicEntries: SearchEntry[] = [
  { to: "/", label: "Home", detail: "Homepage", keywords: pages.home.description },
  { to: "/our-club", label: "Our Club", detail: "About the club and coaches", keywords: `${pages.club.description} coaches cliff meredith chris breshears about` },
  { to: "/practices", label: "Practices", detail: "Practice information", keywords: `${pages.practices.description} lakeshore lanes schedule` },
  { to: "/tournaments", label: "Tournaments", detail: "Dates and venues", keywords: `${pages.tournaments.description} schedule directions venue` },
  { to: "/team-gear", label: "Team Gear", detail: "BSN SPORTS team shop", keywords: `${pages.teamGear.description} apparel clothing store shop bsn` },
  { to: "/sponsors", label: "Sponsors", detail: "Support the team", keywords: `${pages.sponsors.description} sponsorship donate lakeshore lanes` },
  { to: "/fundraisers", label: "Fundraisers", detail: "Upcoming fundraisers", keywords: pages.fundraisers.description },
  { to: "/bowl-a-thon", label: "Bowl-A-Thon", detail: "Donate or pledge", keywords: `${pages.bowlathon.description} donate pledge bowlathon` },
  { to: "/resources", label: "Bowling Resources", detail: "Local services and links", keywords: `${pages.resources.description} equipment pro shop` },
  {
    to: "/volunteer",
    label: "Volunteer Opportunities",
    detail: "Adult volunteers and Sterling Volunteers screening",
    keywords: `${pages.volunteer.description} volunteer sterling background check transportation driver`,
  },
  { to: "/faq", label: "FAQ", detail: "Common questions", keywords: `${pages.faq.description} questions help volunteer capacity` },
  { to: "/contact", label: "Contact Us", detail: "Email the club", keywords: `${pages.contact.description} email volunteer` },
]

export const searchEntries: SearchEntry[] = publicEntries

export function searchSite(query: string, limit = 6) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return []
  return searchEntries
    .map((entry) => {
      const label = entry.label.toLowerCase()
      const haystack = `${label} ${entry.detail.toLowerCase()} ${entry.keywords.toLowerCase()}`
      if (!words.every((word) => haystack.includes(word))) return null
      const score = words.reduce((sum, word) => sum + (label.startsWith(word) ? 3 : label.includes(word) ? 2 : 1), 0)
      return { entry, score }
    })
    .filter((hit): hit is { entry: SearchEntry; score: number } => hit !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((hit) => hit.entry)
}
