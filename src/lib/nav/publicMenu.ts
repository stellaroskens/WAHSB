export type PublicNavItem = {
  to: string
  label: string
  end?: boolean
  hidden?: boolean
  openInNewTab?: boolean
}

const GROUP_ORDER = [
  { id: "overview", title: "Overview", paths: ["/", "/our-club", "/meet-the-bowlers"] },
  { id: "team", title: "Team and events", paths: ["/practices", "/tournaments", "/team-gear"] },
  { id: "support", title: "Support the team", paths: ["/sponsors", "/fundraisers", "/volunteer"] },
  { id: "resources", title: "Resources", paths: ["/resources", "/faq", "/contact"] },
] as const

export function groupPublicNav(items: readonly PublicNavItem[]) {
  const visible = items.filter((item) => !item.hidden)
  const used = new Set<string>()
  const groups = GROUP_ORDER.map((group) => {
    const links = group.paths.flatMap((path) =>
      visible.filter((item) => {
        if (item.to !== path || used.has(item.to)) return false
        used.add(item.to)
        return true
      }),
    )
    return { id: group.id, title: group.title, links }
  }).filter((group) => group.links.length > 0)
  const extra = visible.filter((item) => !used.has(item.to))
  const result: { id: string; title: string; links: PublicNavItem[] }[] = groups.map((group) => ({
    id: group.id,
    title: group.title,
    links: group.links,
  }))
  if (extra.length > 0) result.push({ id: "more", title: "More", links: extra })
  return result
}
