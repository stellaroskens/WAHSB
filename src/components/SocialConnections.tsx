import { approvedPublicHttps, siteConnections } from "../content/siteConnections"

const networks = [
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "youtube", label: "YouTube" },
  { key: "tiktok", label: "TikTok" },
] as const

export function SocialConnections() {
  const items = networks.map((network) => ({
    ...network,
    href: approvedPublicHttps(siteConnections.social[network.key]),
  }))
  const linked = items.filter((item) => item.href)
  if (!import.meta.env.DEV && linked.length === 0) return null

  const visible = import.meta.env.DEV ? items : linked

  return (
    <div className="connect-social">
      <h2>Follow Albany High School Bowling</h2>
      <ul>
        {visible.map((item) => (
          <li key={item.key}>
            {item.href ? (
              <a href={item.href} target="_blank" rel="noopener noreferrer">
                Albany High School Bowling on {item.label}
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            ) : (
              <span className="connect-social__pending">
                <span>{item.label}</span>
                <span>Not connected</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
