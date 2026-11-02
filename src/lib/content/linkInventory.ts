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
  openInNewTab: boolean
  hidden: boolean
  order: number
  reorderable: boolean
  navIndex?: number
}

const BLOCKED_INTERNAL = /^\/(admin|coach|team-administrator|staff|api)(\/|$)/

export const PUBLIC_ROUTES = [
  "/",
  "/our-club",
  "/meet-the-bowlers",
  "/practices",
  "/tournaments",
  "/sponsors",
  "/donate",
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
    name: "Contact form and Bowl-a-thon pledge delivery",
    reason: "The forms can be labeled here, but no email provider or payment provider is connected. Submitting one does not send a message or collect a pledge.",
  },
  {
    name: "Sponsorship QR destination",
    reason: "The page wording is editable. The URL itself stays on Payment Connections and is not shown until it is verified. Editing wording does not turn payments on.",
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
      openInNewTab: Boolean(item?.openInNewTab),
      hidden: Boolean(item?.hidden),
      order: index + 1,
      reorderable: true,
      navIndex: index,
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
      openInNewTab: field.kind !== "internal",
      hidden: false,
      order: links.length + 1,
      reorderable: false,
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

export function moveNavItem(content: SiteContent, index: number, direction: -1 | 1): SiteContent {
  const next = structuredClone(content)
  const target = index + direction
  if (target < 0 || target >= next.nav.length) return content
  const [item] = next.nav.splice(index, 1)
  next.nav.splice(target, 0, item)
  return next
}

export function setNavFlag(content: SiteContent, index: number, key: "openInNewTab" | "hidden", value: boolean): SiteContent {
  const next = structuredClone(content)
  const item = next.nav[index]
  if (!item) return content
  item[key] = value
  return next
}

export function filterLinks(links: ManagedLink[], query: string): ManagedLink[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return links
  return links.filter((link) =>
    [link.location, link.label, link.destination, link.appearsOn, link.kind].join(" ").toLowerCase().includes(needle),
  )
}
