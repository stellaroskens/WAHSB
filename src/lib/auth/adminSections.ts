export type AdminSectionStatus = "unavailable" | "available"

export type AdminSection = {
  id: string
  title: string
  description: string
  status: AdminSectionStatus
  statusLabel: string
  href?: string
}

/** Admin dashboard sections. Interactive only when status is available. */
export const ADMIN_SECTIONS: AdminSection[] = [
  {
    id: "website-pages",
    title: "Website Pages",
    description: "Edit public page content and navigation.",
    status: "available",
    statusLabel: "Open",
    href: "/admin/content",
  },
  {
    id: "tournament-management",
    title: "Practices and Tournaments",
    description: "Edit published venues, practice tournament dates, and the shared practice location.",
    status: "available",
    statusLabel: "Open",
    href: "/admin/content?page=tournaments",
  },
  {
    id: "coaches",
    title: "Coaches",
    description: "Edit public coach biographies. This does not change who can sign in.",
    status: "available",
    statusLabel: "Open",
    href: "/admin/content?page=coaches",
  },
  {
    id: "volunteers",
    title: "Volunteers",
    description: "Edit public volunteer information. Screening records are not stored.",
    status: "available",
    statusLabel: "Open",
    href: "/admin/content?page=volunteer",
  },
  {
    id: "fundraisers",
    title: "Fundraisers",
    description: "Edit published fundraiser names, dates, times, and flyer files.",
    status: "available",
    statusLabel: "Open",
    href: "/admin/content?page=fundraisers",
  },
  {
    id: "sponsors",
    title: "Sponsors",
    description: "Edit sponsor page search text. No sponsor is approved for the public list.",
    status: "available",
    statusLabel: "Open",
    href: "/admin/content?page=sponsors",
  },
  {
    id: "payment-settings",
    title: "Payment Settings",
    description: "Social, email, and payment destinations (Connections).",
    status: "available",
    statusLabel: "Open",
    href: "/admin/connections",
  },
  {
    id: "email-announcements",
    title: "Email Announcements",
    description: "Prepare club announcements. Sending stays off until email is verified.",
    status: "available",
    statusLabel: "Open",
    href: "/admin/announcements",
  },
  {
    id: "staff-accounts",
    title: "Staff Accounts",
    description: "Invite and manage staff Identity accounts.",
    status: "available",
    statusLabel: "Open",
    href: "/admin/staff",
  },
  {
    id: "media-library",
    title: "Media Library",
    description: "Review approved public files. New uploads are not configured.",
    status: "available",
    statusLabel: "Open",
    href: "/admin/media",
  },
  {
    id: "publishing-history",
    title: "Publishing History",
    description: "Review published content commits and load an older version into the editor.",
    status: "available",
    statusLabel: "Open",
    href: "/admin/history",
  },
  {
    id: "site-settings",
    title: "Site Settings",
    description: "Account details and links to shared site content.",
    status: "available",
    statusLabel: "Open",
    href: "/admin/settings",
  },
]
