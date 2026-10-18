import { approvedPublicHttps, siteConnections } from "../content/siteConnections"

const previewActions = [
  "Copy fundraiser link",
  "Share",
  "Text message",
  "Email",
] as const

/** A permanent public https address is required before any share action is available. */
export function FundraiserShare() {
  const publicUrl = approvedPublicHttps(siteConnections.sharing.publicFundraiserUrl)

  if (!publicUrl) {
    if (!import.meta.env.DEV) return null
    return (
      <div className="connect-share">
        <h2>Share this fundraiser</h2>
        <p>
          Design preview — sharing is not connected. A permanent public link has not
          been approved.
        </p>
        <ul>
          {previewActions.map((action) => (
            <li key={action}>
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  const message = `Albany High School Bowling fundraiser: ${publicUrl}`

  return (
    <div className="connect-share connect-share--live">
      <h2>Share this fundraiser</h2>
      <ul>
        <li>
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(publicUrl)
            }}
          >
            Copy fundraiser link
          </button>
        </li>
        <li>
          <a href={`sms:?&body=${encodeURIComponent(message)}`}>Text message</a>
        </li>
        <li>
          <a
            href={`mailto:?subject=${encodeURIComponent("Albany High School Bowling fundraiser")}&body=${encodeURIComponent(message)}`}
          >
            Email
          </a>
        </li>
      </ul>
    </div>
  )
}
