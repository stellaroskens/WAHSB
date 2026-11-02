export type AdminSectionStatus = "unavailable" | "available"

export type AdminSection = {
  id: string
  group: string
  title: string
  description: string
  status: AdminSectionStatus
  statusLabel: string
  href: string
}

/** Super administrator control center. Every section opens a real management screen. */
export const ADMIN_SECTIONS: AdminSection[] = [
  {
    id: "overview",
    group: "Overview",
    title: "Dashboard Overview",
    description:
      "Open every management area from this account. A super administrator does not need a coach or Club Administrator role added to this login.",
    status: "available",
    statusLabel: "Open",
    href: "/admin",
  },
  {
    id: "website-pages",
    group: "Website",
    title: "Website Pages and Content",
    description: "Edit public page copy, save a draft, review changes, and publish through GitHub.",
    status: "available",
    statusLabel: "Open",
    href: "/admin/content",
  },
  {
    id: "meet-the-bowlers",
    group: "Players",
    title: "Meet the Bowlers",
    description:
      "Edit placeholder cards, school logos, biographies, order, and publication status. Real students stay unpublished.",
    status: "available",
    statusLabel: "Open",
    href: "/admin/bowlers",
  },
  {
    id: "staff-accounts",
    group: "People",
    title: "Coaches and Staff",
    description: "Open the coach dashboard and coach settings with this login. Staff invitations stay on the staff page.",
    status: "available",
    statusLabel: "Open",
    href: "/admin/coaches",
  },
  {
    id: "club-administrator",
    group: "People",
    title: "Club Administrator Management",
    description: "Open the Club Administrator dashboard and permitted settings without signing in as that person.",
    status: "available",
    statusLabel: "Open",
    href: "/admin/club",
  },
  {
    id: "tournament-management",
    group: "Season",
    title: "Tournament Management",
    description: "Check venues and edit published tournament dates.",
    status: "available",
    statusLabel: "Open",
    href: "/admin/tournaments",
  },
  {
    id: "practice-schedules",
    group: "Season",
    title: "Practice Schedules",
    description: "Edit the shared practice location and practice page search text.",
    status: "available",
    statusLabel: "Open",
    href: "/admin/content?page=practices",
  },
  {
    id: "player-statistics",
    group: "Players",
    title: "Player Statistics",
    description: "Enter scores only when the club has verified them. Missing numbers stay blank.",
    status: "available",
    statusLabel: "Open",
    href: "/admin/bowlers#player-statistics",
  },
  {
    id: "volunteers",
    group: "Season",
    title: "Volunteers",
    description: "Edit public volunteer information. Screening records are not stored.",
    status: "available",
    statusLabel: "Open",
    href: "/admin/content?page=volunteer",
  },
  {
    id: "fundraisers",
    group: "Season",
    title: "Fundraisers",
    description: "Edit published fundraiser names, dates, times, and flyer files.",
    status: "available",
    statusLabel: "Open",
    href: "/admin/content?page=fundraisers",
  },
  {
    id: "sponsors",
    group: "Season",
    title: "Sponsors",
    description: "Edit sponsor page search text. No sponsor is approved for the public list.",
    status: "available",
    statusLabel: "Open",
    href: "/admin/content?page=sponsors",
  },
  {
    id: "payment-settings",
    group: "Money",
    title: "Payment Connections",
    description: "Prepare Stripe, PayPal, Venmo, and Cash App. Live payments stay off until verified.",
    status: "available",
    statusLabel: "Open",
    href: "/admin/connections",
  },
  {
    id: "email-announcements",
    group: "Messages",
    title: "Email Announcements",
    description: "Prepare announcements. Sending stays off until email is verified.",
    status: "available",
    statusLabel: "Sending off",
    href: "/admin/announcements",
  },
  {
    id: "family-accounts",
    group: "People",
    title: "Family Account Management",
    description: "Review the closed family workflow. Invitations are not sent from this page.",
    status: "available",
    statusLabel: "Closed",
    href: "/admin/family",
  },
  {
    id: "guardian-consent",
    group: "People",
    title: "Guardian Consent",
    description: "See what private consent storage still needs. Consent is not saved in GitHub.",
    status: "available",
    statusLabel: "Not connected",
    href: "/admin/consent",
  },
  {
    id: "media-library",
    group: "Site",
    title: "Media Library",
    description: "Review approved public files. New uploads are not configured.",
    status: "available",
    statusLabel: "Open",
    href: "/admin/media",
  },
  {
    id: "navigation-branding",
    group: "Website",
    title: "Site Navigation and Branding",
    description: "Edit the public navigation labels and the registration notice.",
    status: "available",
    statusLabel: "Open",
    href: "/admin/content?page=home&section=navigation",
  },
  {
    id: "site-settings",
    group: "Website",
    title: "SEO and Site Settings",
    description: "Review this account and open each page's search title and description.",
    status: "available",
    statusLabel: "Open",
    href: "/admin/settings",
  },
  {
    id: "publishing-history",
    group: "Site",
    title: "Publishing History",
    description: "Review published content commits and load an older version into the editor.",
    status: "available",
    statusLabel: "Open",
    href: "/admin/history",
  },
  {
    id: "system-status",
    group: "Site",
    title: "System Status and Setup",
    description: "See which services are configured. Secrets are not shown.",
    status: "available",
    statusLabel: "Open",
    href: "/admin/status",
  },
]

export function adminSectionGroups(sections: readonly AdminSection[] = ADMIN_SECTIONS): string[] {
  return [...new Set(sections.map((section) => section.group))]
}
