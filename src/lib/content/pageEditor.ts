import { validateSiteContent, type SiteContent, type SiteContentIssue } from "./siteContent.ts"

export const DRAFT_PREVIEW_LABEL = "DRAFT PREVIEW — NOT PUBLISHED"

export const GITHUB_SETUP_STEPS = [
  "Create a fine-grained personal access token. Do not create a classic personal access token.",
  "In GitHub, open Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.",
  "Resource owner: the account that owns stellarkoskens/WAHSB. Repository access: Only select repositories → WAHSB.",
  "Repository permission: Contents → Read and write. Leave every other permission at No access. Metadata stays Read-only because GitHub requires it.",
  "In Netlify, open Project configuration → Environment variables → Add a variable. Key: GITHUB_CONTENT_TOKEN. Mark it secret. Scope it to Functions for production and deploy previews.",
  "Do not paste the token into this page, into chat, or into frontend code. Redeploy the site so the function can read the variable.",
] as const

export type EditorCoverage = "full" | "partial" | "unavailable"

export type EditorPage = {
  id: string
  label: string
  route: string
  coverage: EditorCoverage
  coverageLabel: string
  summary: string
}

export type EditorField = {
  path: string
  label: string
  kind: "text" | "textarea" | "internal" | "https" | "optional-https" | "lines"
  help?: string
  required: boolean
}

export type EditorSection = {
  id: string
  pageIds: string[]
  label: string
  help: string
  fields: EditorField[]
  lockedReason?: string
}

const page = (
  id: string,
  label: string,
  route: string,
  coverage: EditorCoverage,
  coverageLabel: string,
  summary: string,
): EditorPage => ({ id, label, route, coverage, coverageLabel, summary })

export const EDITOR_PAGES: EditorPage[] = [
  page("home", "Home", "/", "full", "Editable", "Headings, buttons, cards, the registration notice, and the Lakeshore thank-you."),
  page("our-club", "Our Club", "/our-club", "full", "Editable", "Club introduction, team bowling, volunteers, college links, and the help banner."),
  page("coaches", "Coach profiles", "/our-club#coaches", "full", "Editable", "Public names, roles, and biographies. This does not change who can sign in."),
  page("team-gear", "Team Gear", "/team-gear", "full", "Editable", "Shop wording and the BSN SPORTS links."),
  page("practices", "Practices", "/practices", "partial", "Partly editable", "Search text and the shared Lakeshore Lanes location. The practice introduction stays in the page layout."),
  page("tournaments", "Tournaments", "/tournaments", "partial", "Partly editable", "Search text and the shared registration notice. Dates stay in Tournament Management."),
  page("sponsors", "Sponsors", "/sponsors", "partial", "Partly editable", "Search text and the shared Lakeshore location. Sponsor listings stay empty until the club approves one."),
  page("fundraisers", "Fundraisers", "/fundraisers", "partial", "Partly editable", "Search text only. Campaign cards stay in the content file for a later fundraiser editor."),
  page("bowl-a-thon", "Bowl-a-thon", "/bowl-a-thon", "partial", "Partly editable", "Search text only. The pledge form is a preview and does not collect a pledge."),
  page("resources", "Bowling Resources", "/resources", "partial", "Partly editable", "Search text only. Resource listings are still written in code."),
  page("volunteer", "Volunteer Opportunities", "/volunteer", "partial", "Partly editable", "Search text and the shared registration notice. Screening records are not stored here."),
  page("faq", "FAQ", "/faq", "partial", "Partly editable", "Search text only. Questions and answers are still written in code."),
  page("contact", "Contact", "/contact", "partial", "Partly editable", "Search text and the shared registration notice. The contact form does not send mail."),
  page("sponsor-qr", "Sponsorship QR", "/sponsor-qr", "unavailable", "Not editable yet", "This page is still written in the page component."),
  page("sign-in", "Sign in", "/sign-in", "unavailable", "Not a content page", "Account access stays on the sign-in page. It is not website copy."),
  page("family", "Family", "/family", "unavailable", "Not a content page", "Family access is closed. This page is not website copy."),
]

function field(
  path: string,
  label: string,
  kind: EditorField["kind"] = "text",
  help?: string,
): EditorField {
  return { path, label, kind, help, required: kind !== "optional-https" && !path.endsWith("imageAlt") }
}

function seo(pageId: string, pageKey: string): EditorSection {
  return {
    id: `seo-${pageId}`,
    pageIds: [pageId],
    label: "Search title and description",
    help: "Shown as the browser title and the short description for this page.",
    fields: [
      field(`pages.${pageKey}.title`, "Page title"),
      field(`pages.${pageKey}.description`, "Description", "textarea"),
    ],
  }
}

function locked(id: string, pageIds: string[], label: string, reason: string): EditorSection {
  return { id, pageIds, label, help: reason, fields: [], lockedReason: reason }
}

const registration: EditorSection = {
  id: "registration",
  pageIds: ["home", "our-club", "practices", "tournaments", "volunteer", "contact"],
  label: "Registration closed notice",
  help: "The same notice is shown on every page that uses it. Saving here updates all of those pages. It does not open student registration.",
  fields: [
    field("seasonRegistrationClosed.heading", "Heading"),
    field("seasonRegistrationClosed.description", "Paragraph", "textarea"),
    field("seasonRegistrationClosed.volunteerSecondary", "Volunteer sentence", "textarea"),
    field("seasonRegistrationClosed.volunteerCtaLabel", "Button label"),
    field("seasonRegistrationClosed.volunteerCtaTo", "Button destination", "internal", "Use a path on this site, such as /volunteer."),
  ],
}

const practiceLocation: EditorSection = {
  id: "practice-location",
  pageIds: ["home", "practices", "sponsors"],
  label: "Lakeshore Lanes location",
  help: "This address is shared by the homepage thank-you, Practices, and Sponsors. The logo file cannot be replaced here.",
  fields: [
    field("practiceLocation.name", "Place name"),
    field("practiceLocation.street", "Street"),
    field("practiceLocation.locality", "City and ZIP"),
    field("practiceLocation.address", "Full address"),
    field("practiceLocation.phone", "Phone"),
    field("practiceLocation.phoneHref", "Phone link", "text", "Use tel:+ and digits, such as tel:+15419264631."),
    field("practiceLocation.website", "Website", "https"),
    field("practiceLocation.directions", "Directions link", "https"),
    field("practiceLocation.detail", "Note", "textarea"),
  ],
}

export const EDITOR_SECTIONS: EditorSection[] = [
  seo("home", "home"),
  registration,
  {
    id: "home-hero",
    pageIds: ["home"],
    label: "Hero",
    help: "The top headline and the donate button. The same button label is used in the homepage header.",
    fields: [
      field("pageBodies.home.hero.imageAlt", "Image description", "text", "Leave blank if the picture is decorative."),
      field("pageBodies.home.hero.heading", "Heading"),
      field("pageBodies.home.hero.description", "Paragraph", "textarea"),
      field("pageBodies.home.hero.buttonLabel", "Button label"),
      field("pageBodies.home.hero.buttonTo", "Button destination", "internal"),
    ],
  },
  {
    id: "home-club",
    pageIds: ["home"],
    label: "Club introduction",
    help: "The navy and red headline under the hero. The website logo in this section is not a student photo and is not replaced here.",
    fields: [
      field("pageBodies.home.club.eyebrow", "Small label"),
      field("pageBodies.home.club.headingNavy", "Navy heading"),
      field("pageBodies.home.club.headingRed", "Red heading"),
      field("pageBodies.home.club.description", "Paragraph", "textarea"),
      field("pageBodies.home.club.primaryLabel", "First button"),
      field("pageBodies.home.club.primaryTo", "First button destination", "internal"),
      field("pageBodies.home.club.secondaryLabel", "Second button"),
      field("pageBodies.home.club.secondaryTo", "Second button destination", "internal"),
    ],
  },
  {
    id: "home-cards",
    pageIds: ["home"],
    label: "Practices, gear, and tournaments cards",
    help: "Three cards only. The pictures stay the approved artwork already on the page.",
    fields: [
      field("pageBodies.home.cards.0.heading", "Practices heading"),
      field("pageBodies.home.cards.0.description", "Practices paragraph", "textarea"),
      field("pageBodies.home.cards.0.linkLabel", "Practices link"),
      field("pageBodies.home.cards.0.linkTo", "Practices destination", "internal"),
      field("pageBodies.home.cards.0.imageAlt", "Practices image description"),
      field("pageBodies.home.cards.1.heading", "Team gear heading"),
      field("pageBodies.home.cards.1.description", "Team gear paragraph", "textarea"),
      field("pageBodies.home.cards.1.linkLabel", "Team gear link"),
      field("pageBodies.home.cards.1.linkTo", "Team gear destination", "internal"),
      field("pageBodies.home.cards.1.imageAlt", "Team gear image description"),
      field("pageBodies.home.cards.2.heading", "Tournaments heading"),
      field("pageBodies.home.cards.2.description", "Tournaments paragraph", "textarea"),
      field("pageBodies.home.cards.2.linkLabel", "Tournaments link"),
      field("pageBodies.home.cards.2.linkTo", "Tournaments destination", "internal"),
      field("pageBodies.home.cards.2.imageAlt", "Tournaments image description"),
    ],
  },
  {
    id: "home-fundraisers",
    pageIds: ["home"],
    label: "Fundraiser heading",
    help: "The campaign cards themselves are edited with the fundraiser records, not in this section.",
    fields: [
      field("pageBodies.home.fundraisersHeading", "Section heading"),
      field("pageBodies.home.fundraiserLinkLabel", "Card link label"),
    ],
  },
  {
    id: "home-thanks",
    pageIds: ["home"],
    label: "Lakeshore thank-you",
    help: "The address and phone come from the Lakeshore Lanes location section.",
    fields: [
      field("pageBodies.home.thanks.heading", "Heading"),
      field("pageBodies.home.thanks.description", "Paragraph", "textarea"),
      field("pageBodies.home.thanks.directionsLabel", "Directions button"),
      field("pageBodies.home.thanks.websiteLabel", "Website button"),
    ],
  },
  {
    id: "home-footer",
    pageIds: ["home"],
    label: "Homepage footer title",
    help: "The footer links stay in the page layout.",
    fields: [
      field("pageBodies.home.footerTitle", "Title"),
      field("pageBodies.home.footerEventLabel", "Event name"),
    ],
  },
  {
    id: "navigation",
    pageIds: ["home"],
    label: "Navigation labels",
    help: "Changes the words in the menu. The page addresses stay fixed.",
    fields: [
      field("nav.0.label", "Home"),
      field("nav.1.label", "Our Club"),
      field("nav.2.label", "Practices"),
      field("nav.3.label", "Tournaments"),
      field("nav.4.label", "Team Gear"),
      field("nav.5.label", "Sponsors"),
      field("nav.6.label", "Fundraisers"),
      field("nav.7.label", "Bowling Resources"),
      field("nav.8.label", "Volunteer Opportunities"),
      field("nav.9.label", "FAQ"),
      field("nav.10.label", "Contact Us"),
    ],
  },
  practiceLocation,
  seo("our-club", "club"),
  {
    id: "club-intro",
    pageIds: ["our-club"],
    label: "Introduction",
    help: "One paragraph per line. The registration notice below it is the shared notice.",
    fields: [
      field("pageBodies.club.heroTitle", "Page heading"),
      field("pageBodies.club.coachesButtonLabel", "Coaches button"),
      field("pageBodies.club.intro", "Paragraphs", "lines"),
    ],
  },
  {
    id: "coach-cliff",
    pageIds: ["our-club", "coaches"],
    label: "Cliff Meredith",
    help: "Public biography only. The portrait and the sign-in account stay as they are.",
    fields: [
      field("coaches#cliff-meredith.name", "Display name"),
      field("coaches#cliff-meredith.role", "Role shown on the page"),
      field("coaches#cliff-meredith.summary", "Biography", "textarea"),
    ],
  },
  {
    id: "coach-chris",
    pageIds: ["our-club", "coaches"],
    label: "Chris Breshears",
    help: "Public biography only. The portrait and the sign-in account stay as they are.",
    fields: [
      field("coaches#chris-breshears.name", "Display name"),
      field("coaches#chris-breshears.role", "Role shown on the page"),
      field("coaches#chris-breshears.summary", "Biography", "textarea"),
    ],
  },
  {
    id: "club-admin",
    pageIds: ["our-club", "coaches"],
    label: "Club administrator display",
    help: "This is the name shown on Our Club. Typing a name here does not grant dashboard access.",
    fields: [
      field("pageBodies.club.administratorTitle", "Title"),
      field("pageBodies.club.administratorName", "Display name"),
      field("pageBodies.club.coachesHeading", "Coaches section heading"),
      field("pageBodies.club.coachesNote", "Coaches note", "textarea"),
    ],
  },
  {
    id: "club-team",
    pageIds: ["our-club"],
    label: "Team bowling",
    help: "One paragraph or bullet per line. The five Baker rows stay five rows.",
    fields: [
      field("pageBodies.club.teamSport.heading", "Heading"),
      field("pageBodies.club.teamSport.paragraphs", "Paragraphs", "lines"),
      field("pageBodies.club.teamSport.bullets", "Bullet points", "lines"),
      field("pageBodies.club.bakerFrames.0.bowler", "Bowler 1 label"),
      field("pageBodies.club.bakerFrames.0.frames", "Bowler 1 frames"),
      field("pageBodies.club.bakerFrames.1.bowler", "Bowler 2 label"),
      field("pageBodies.club.bakerFrames.1.frames", "Bowler 2 frames"),
      field("pageBodies.club.bakerFrames.2.bowler", "Bowler 3 label"),
      field("pageBodies.club.bakerFrames.2.frames", "Bowler 3 frames"),
      field("pageBodies.club.bakerFrames.3.bowler", "Bowler 4 label"),
      field("pageBodies.club.bakerFrames.3.frames", "Bowler 4 frames"),
      field("pageBodies.club.bakerFrames.4.bowler", "Bowler 5 label"),
      field("pageBodies.club.bakerFrames.4.frames", "Bowler 5 frames"),
      field("pageBodies.club.teamSport.lineupNote", "Lineup note", "textarea"),
      field("pageBodies.club.teamSport.buttonLabel", "Button label"),
      field("pageBodies.club.teamSport.buttonTo", "Button destination", "internal"),
    ],
  },
  {
    id: "club-volunteers",
    pageIds: ["our-club"],
    label: "Volunteers on Our Club",
    help: "Public description only. Do not enter screening results or private contact lists.",
    fields: [
      field("pageBodies.club.volunteers.heading", "Heading"),
      field("pageBodies.club.volunteers.paragraphs", "Paragraphs", "lines"),
      field("pageBodies.club.volunteers.bullets", "Bullet points", "lines"),
    ],
  },
  {
    id: "club-college",
    pageIds: ["our-club"],
    label: "College bowling",
    help: "Keep the three approved USBC links. Use https addresses only.",
    fields: [
      field("pageBodies.club.college.heading", "Heading"),
      field("pageBodies.club.college.intro", "Introduction", "textarea"),
      field("pageBodies.club.college.bullets", "Bullet points", "lines"),
      field("pageBodies.club.college.disclaimer", "Link note", "textarea"),
      field("pageBodies.club.college.links.0.label", "First link label"),
      field("pageBodies.club.college.links.0.href", "First link address", "https"),
      field("pageBodies.club.college.links.1.label", "Second link label"),
      field("pageBodies.club.college.links.1.href", "Second link address", "https"),
      field("pageBodies.club.college.links.2.label", "Third link label"),
      field("pageBodies.club.college.links.2.href", "Third link address", "https"),
      field("pageBodies.club.college.buttonLabel", "Button label"),
      field("pageBodies.club.college.buttonTo", "Button destination", "internal"),
    ],
  },
  {
    id: "club-help",
    pageIds: ["our-club"],
    label: "Help banner",
    help: "The closing band at the bottom of Our Club.",
    fields: [
      field("pageBodies.club.help.heading", "Heading"),
      field("pageBodies.club.help.description", "Paragraph", "textarea"),
      field("pageBodies.club.help.buttonLabel", "Button label"),
      field("pageBodies.club.help.buttonTo", "Button destination", "internal"),
    ],
  },
  seo("team-gear", "teamGear"),
  {
    id: "gear-shop",
    pageIds: ["team-gear"],
    label: "Shop link",
    help: "Leave the team store link empty until the club has a real storefront address. An empty link does not turn on checkout.",
    fields: [
      field("teamGearShop.name", "Shop name"),
      field("teamGearShop.url", "Shop website", "https"),
      field("teamGearShop.teamStoreUrl", "Team store link", "optional-https", "Optional. Use https, or leave blank."),
    ],
  },
  {
    id: "gear-copy",
    pageIds: ["team-gear"],
    label: "Team Gear wording",
    help: "The shop name from the section above is added at the end of the lead sentence and the button.",
    fields: [
      field("pageBodies.teamGear.eyebrow", "Small label"),
      field("pageBodies.teamGear.title", "Page heading"),
      field("pageBodies.teamGear.heading", "Card heading"),
      field("pageBodies.teamGear.leadBeforeShopName", "Sentence before the shop name", "textarea"),
      field("pageBodies.teamGear.buttonBeforeShopName", "Button text before the shop name"),
      field("pageBodies.teamGear.missingStorefrontNote", "Note when no team store link is set", "textarea"),
    ],
  },
  seo("practices", "practices"),
  seo("tournaments", "tournaments"),
  seo("sponsors", "sponsors"),
  seo("fundraisers", "fundraisers"),
  seo("bowl-a-thon", "bowlathon"),
  seo("resources", "resources"),
  seo("volunteer", "volunteer"),
  seo("faq", "faq"),
  seo("contact", "contact"),
  locked(
    "practices-body",
    ["practices"],
    "Practice introduction",
    "The practice introduction and FAQ embeds are still written in the page component. The location fields above are the part this editor can save.",
  ),
  locked(
    "tournaments-body",
    ["tournaments"],
    "Tournament schedule",
    "Tournament dates are stored in this content file and reviewed in Tournament Management. This page editor does not change dates yet, so a date cannot be saved from here by mistake.",
  ),
  locked(
    "sponsors-body",
    ["sponsors"],
    "Sponsor listings",
    "No sponsor is approved for the public list. This editor will not add one.",
  ),
  locked(
    "fundraisers-body",
    ["fundraisers"],
    "Fundraiser campaigns",
    "Campaign cards are in the content file, but this first editor does not change payment or campaign details.",
  ),
  locked(
    "bowlathon-body",
    ["bowl-a-thon"],
    "Pledge form",
    "The Bowl-a-thon form is a preview. It does not send or save a pledge, and this editor does not turn that on.",
  ),
  locked(
    "resources-body",
    ["resources"],
    "Resource listings",
    "Resource descriptions are still written in code, outside the published content file.",
  ),
  locked(
    "volunteer-body",
    ["volunteer"],
    "Volunteer instructions",
    "The Sterling Volunteers page and the rest of the volunteer article are not in this first set of fields. Screening results are never stored in GitHub.",
  ),
  locked(
    "faq-body",
    ["faq"],
    "Questions and answers",
    "FAQ entries are still written in code. Saving a question here is not available yet.",
  ),
  locked(
    "contact-body",
    ["contact"],
    "Contact form",
    "The contact form does not send email. Club email delivery is not connected, so this editor cannot store a message inbox.",
  ),
  locked("sponsor-qr-body", ["sponsor-qr"], "Sponsorship QR", "This page is still written in the page component."),
  locked("sign-in-body", ["sign-in"], "Sign in", "Sign-in screens are account access, not public page copy."),
  locked("family-body", ["family"], "Family page", "Family access is closed and is not edited as website copy."),
]

const FIELDS = EDITOR_SECTIONS.flatMap((section) => section.fields)
const FIELD_BY_PATH = new Map(FIELDS.map((item) => [item.path, item]))

export function sectionsForPage(pageId: string): EditorSection[] {
  return EDITOR_SECTIONS.filter((section) => section.pageIds.includes(pageId))
}

export function pageById(pageId: string): EditorPage | undefined {
  return EDITOR_PAGES.find((item) => item.id === pageId)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function step(current: unknown, segment: string): unknown {
  const keyed = /^([A-Za-z]+)#([A-Za-z0-9-]+)$/.exec(segment)
  if (keyed) {
    if (!isRecord(current)) return undefined
    const list = current[keyed[1]]
    if (!Array.isArray(list)) return undefined
    return list.find((item: unknown) => isRecord(item) && item.id === keyed[2])
  }
  if (Array.isArray(current) && /^\d+$/.test(segment)) return current[Number(segment)]
  if (isRecord(current)) return current[segment]
  return undefined
}

export function readPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, segment) => step(current, segment), source)
}

function writePath(source: SiteContent, path: string, value: unknown) {
  const segments = path.split(".")
  let current: unknown = source
  for (const segment of segments.slice(0, -1)) {
    current = step(current, segment)
  }
  const last = segments[segments.length - 1]
  if (Array.isArray(current) && /^\d+$/.test(last)) current[Number(last)] = value
  else if (isRecord(current)) current[last] = value
  else throw new Error(`Cannot edit ${path}.`)
}

function coerce(item: EditorField, raw: string): unknown {
  if (item.kind === "lines") return raw.split(/\r?\n/)
  if (item.kind === "optional-https") return raw.trim() ? raw.trim() : null
  return raw
}

export function fieldText(content: SiteContent, item: EditorField): string {
  const value = readPath(content, item.path)
  if (item.kind === "lines" && Array.isArray(value)) return value.map(String).join("\n")
  if (value == null) return ""
  return String(value)
}

export function editField(content: SiteContent, path: string, raw: string): SiteContent {
  const item = FIELD_BY_PATH.get(path)
  if (!item) throw new Error("That field is not editable.")
  const next = structuredClone(content)
  writePath(next, path, coerce(item, raw))
  return next
}

export function prepareContentForSave(content: SiteContent): SiteContent {
  const next = structuredClone(content)
  for (const item of FIELDS) {
    const value = readPath(next, item.path)
    if (item.kind === "lines" && Array.isArray(value)) {
      writePath(
        next,
        item.path,
        value.map((line) => String(line).trim()).filter(Boolean),
      )
    } else if (typeof value === "string") {
      const trimmed = value.trim()
      writePath(next, item.path, item.kind === "optional-https" ? trimmed || null : trimmed)
    } else if (item.kind === "optional-https") {
      writePath(next, item.path, null)
    }
  }
  return next
}

export function contentFromDraftPayload(
  payload: unknown,
): { ok: true; content: SiteContent; status: string } | { ok: false; message: string } {
  if (!isRecord(payload)) return { ok: false, message: "The saved draft could not be read." }
  const draft = isRecord(payload.draft) ? payload.draft : null
  if (!draft || !("content" in draft)) return { ok: false, message: "The saved draft has no page content." }
  const issues = validateSiteContent(draft.content)
  if (issues.length) {
    return {
      ok: false,
      message: "That draft does not match the current pages, so it was not loaded. The live site is unchanged.",
    }
  }
  return {
    ok: true,
    content: structuredClone(draft.content) as SiteContent,
    status: typeof draft.status === "string" ? draft.status : "draft",
  }
}

export function draftRecordStatus(submitForApproval: boolean): "draft" | "pending_approval" {
  return submitForApproval ? "pending_approval" : "draft"
}

export function draftRequestBody(id: string, content: SiteContent, submitForApproval: boolean) {
  return {
    id,
    content,
    submitForApproval,
    message: submitForApproval ? `content: submit ${id} for approval` : `content: save draft ${id}`,
  }
}

export function publishRequestBody(content: SiteContent) {
  return {
    content,
    message: "content: publish approved site content",
  }
}

export function failureMessage(status: number, body: { error?: string; code?: string }): string {
  if (body.code === "github_token_missing" || status === 503) {
    return `${body.error || "GitHub publishing is not configured."} Nothing was saved. The live site is unchanged.`
  }
  if (status === 401 || status === 403) {
    return "You are not authorized for that action. Publishing requires the super administrator role. Nothing was changed."
  }
  return body.error || "The content service could not finish that request. Nothing was changed on the live site."
}

export function successMessage(
  intent: "draft" | "approval" | "publish",
  body: { commitSha?: string; note?: string },
): string | null {
  if (!body.commitSha) return null
  const sha = body.commitSha.slice(0, 7)
  if (intent === "publish") {
    return (
      body.note ||
      `GitHub commit ${sha} is saved. A commit is not the same as a finished Netlify deploy. The live site updates after that deploy completes.`
    )
  }
  if (intent === "approval") {
    return `Draft submitted for approval (commit ${sha}). It is not published, and the live site is unchanged.`
  }
  return `Draft saved (commit ${sha}). The live site is unchanged.`
}

function storedIssuePath(content: SiteContent, path: string): string {
  const keyed = /^coaches#([A-Za-z0-9-]+)\.(.+)$/.exec(path)
  if (!keyed) return path
  const index = content.coaches.findIndex((coach) => coach.id === keyed[1])
  return index >= 0 ? `coaches.${index}.${keyed[2]}` : path
}

export function issuesForSection(
  content: SiteContent,
  section: EditorSection,
  issues: SiteContentIssue[],
): SiteContentIssue[] {
  const paths = new Set(section.fields.flatMap((item) => [item.path, storedIssuePath(content, item.path)]))
  return issues.filter((issue) => paths.has(issue.path))
}
