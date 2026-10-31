export const AHSB_LOGO = "/images/schools/ahsb-main-logo.png"

export const SCHOOL_IDS = ["south-albany", "west-albany", "lebanon"] as const
export type SchoolId = (typeof SCHOOL_IDS)[number]
export type LogoStyle = "full" | "mark"

export const SCHOOLS: Record<
  SchoolId,
  { label: string; full: string; mark: string; fullAlt: string; markAlt: string }
> = {
  "south-albany": {
    label: "South Albany",
    full: "/images/schools/south-albany-logo.png",
    mark: "/images/schools/south-albany-mark.png",
    fullAlt: "South Albany bowling logo",
    markAlt: "South Albany eagle",
  },
  "west-albany": {
    label: "West Albany",
    full: "/images/schools/west-albany-logo.png",
    mark: "/images/schools/west-albany-mark.png",
    fullAlt: "West Albany bowling logo",
    markAlt: "West Albany bulldog",
  },
  lebanon: {
    label: "Lebanon",
    full: "/images/schools/lebanon-logo.png",
    mark: "/images/schools/lebanon-mark.png",
    fullAlt: "Lebanon bowling logo",
    markAlt: "Lebanon LW initials",
  },
}

export function schoolLogo(school: SchoolId, style: LogoStyle): { src: string; alt: string } {
  const entry = SCHOOLS[school]
  return style === "mark" ? { src: entry.mark, alt: entry.markAlt } : { src: entry.full, alt: entry.fullAlt }
}
