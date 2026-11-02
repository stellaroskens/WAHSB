import { EDITOR_PAGES, EDITOR_SECTIONS } from "./pageEditor.ts"
import type { SiteContent } from "./siteContent.ts"

export type ManagedLink = {
  id: string
  location: string
  labelPath: string
  destinationPath: string
  label: string
  destination: string
  kind: "internal" | "external"
  appearsOn: string
}

const BLOCKED_INTERNAL = /^\/(admin|coach|team-administrator|staff|api)(\/|$)/

export const PUBLIC_ROUTES = [
  "/",
  "/our-club",
  "/meet-the-bowlers",
  "/practices",
  "/tournaments",
  "/sponsors",
  "/sponsor-qr",
  "/fundraisers",
  "/resources",
  "/volunteer",
  "/contact",
  "/faq",
  "/bowl-a-thon",
  "/team-gear",
  "/sign-in",
  "/family",
] as const

export const CODE_ONLY_SETTINGS = [
  {
    name: "FAQ questions and answers",
    reason: "The questions live in the site code because each answer can include structured guidance. The contact form on that page does not send email.",
  },
  {
    name: "Bowling resource business listings",
    reason: "Approved business names, hours, and phones are verified records in code. A blank listing stays empty until the club approves one.",
  },
  {
    name: "Practice introduction, tournament etiquette, fundraiser instructions, and Bowl-a-thon directions",
    reason: "Those articles are still written in the page layout. Dates, venues, and campaign records are editable. The Bowl-a-thon form does not collect a pledge.",
  },
  {
    name: "Sponsorship QR page",
    reason: "The page stays in code until the club approves one public sponsorship destination.",
  },
  {
    name: "Contact form and announcement delivery",
    reason: "No email provider is connected. The form and announcement drafts do not send messages.",
  },
  {
    name: "Payments, consent storage, family accounts, and student photos",
    reason: "Those stay off until private storage, verification, and server checks exist. They are not public page copy.",
  },
] as const

function readText(content: SiteContent, path: string): string {
  const value = path.split(".").reduce<unknown>((current, segment) => {
    if (Array.isArray(current) && /^\d+$/.test(segment)) return current[Number(segment)]
    if (current && typeof current === "object" && segment in current) return (current as Record<string, unknown>)[segment]
    return undefined
  }, content)
  return value == null ? "" : String(value)
}

export function managedLinks(content: SiteContent): ManagedLink[] {
  const links: ManagedLink[] = []
  const fields = EDITOR_SECTIONS.flatMap((section) => section.fields.map((field) => ({ section, field })))

  for (let index = 0; index < content.nav.length; index += 1) {
    const item = content.nav[index]
    links.push({
      id: `nav-${index}`,
      location: "Header, mobile menu, and footer",
      labelPath: `nav.${index}.label`,
      destinationPath: `nav.${index}.to`,
      label: item?.label ?? "",
      destination: item?.to ?? "",
      kind: "internal",
      appearsOn: "Every public page",
    })
  }

  for (const { section, field } of fields) {
    const isDestination = field.kind === "internal" || field.kind === "https" || field.kind === "optional-https"
    if (!isDestination || field.path.startsWith("nav.")) continue
    const labelField = fields.find((item) => item.field.path === field.path.replace(/To$/, "Label"))
    const page = EDITOR_PAGES.find((item) => section.pageIds.includes(item.id))
    links.push({
      id: field.path,
      location: page?.label ?? section.label,
      labelPath: labelField?.field.path ?? field.path,
      destinationPath: field.path,
      label: labelField ? readText(content, labelField.field.path) : field.label,
      destination: readText(content, field.path),
      kind: field.kind === "internal" ? "internal" : "external",
      appearsOn: page?.route ?? section.label,
    })
  }

  return links
}

export function validateLinkDestination(
  destination: string,
  kind: "internal" | "external",
): { ok: true; destination: string } | { ok: false; message: string } {
  const value = destination.trim()
  if (!value) return { ok: false, message: "Enter a destination." }
  if (/^(javascript|data|vbscript):/i.test(value)) {
    return { ok: false, message: "That link type is not allowed." }
  }
  if (kind === "internal") {
    if (!value.startsWith("/") || value.startsWith("//")) {
      return { ok: false, message: "Choose a page on this website." }
    }
    if (BLOCKED_INTERNAL.test(value)) {
      return { ok: false, message: "Staff, payment, and system paths cannot be used as public links." }
    }
    if (!/^\/[A-Za-z0-9/_.#-]*$/.test(value)) {
      return { ok: false, message: "Use a normal website path, such as /practices." }
    }
    return { ok: true, destination: value }
  }
  if (!/^https:\/\/[^\s]+$/.test(value)) {
    return { ok: false, message: "External links must start with https://." }
  }
  return { ok: true, destination: value }
}

export function filterLinks(links: ManagedLink[], query: string): ManagedLink[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return links
  return links.filter((link) =>
    [link.location, link.label, link.destination, link.appearsOn, link.kind].join(" ").toLowerCase().includes(needle),
  )
}
