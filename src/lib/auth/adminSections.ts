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
    title: "Tournament Management",
    description: "Schedule and publish tournament details.",
    status: "unavailable",
    statusLabel: "Unavailable until implemented",
  },
  {
    id: "coaches",
    title: "Coaches",
    description: "Manage coach profiles and access.",
    status: "unavailable",
    statusLabel: "Unavailable until implemented",
  },
  {
    id: "volunteers",
    title: "Volunteers",
    description: "Coordinate volunteer roles and sign-ups.",
    status: "unavailable",
    statusLabel: "Unavailable until implemented",
  },
  {
    id: "fundraisers",
    title: "Fundraisers",
    description: "Track fundraising campaigns and status.",
    status: "unavailable",
    statusLabel: "Unavailable until implemented",
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
    description: "Upload and organize site media assets.",
    status: "unavailable",
    statusLabel: "Unavailable until implemented",
  },
  {
    id: "publishing-history",
    title: "Publishing History",
    description: "Review what changed and when it went live.",
    status: "unavailable",
    statusLabel: "Unavailable until implemented",
  },
  {
    id: "site-settings",
    title: "Site Settings",
    description: "Club-wide settings and operational toggles.",
    status: "unavailable",
    statusLabel: "Unavailable until implemented",
  },
]
