import { PageMeta } from "../../components/PageMeta"
import { siteConnectionsConfig } from "../../content/siteConnections"

export function AdminAnnouncements() {
  const email = siteConnectionsConfig.email
  const ready = email.liveEnabled && email.status === "verified"

  return (
    <div className="admin-page">
      <PageMeta
        title="Email Announcements | Albany High School Bowling"
        description="Prepared email announcements dashboard for Albany High School Bowling staff."
      />
      <div className="admin-page__intro">
        <h2>Email announcements</h2>
        <p>
          Prepare club announcements here later. Sending stays disabled until an email connection is verified and
          enabled by a super_admin. No messages are sent from this screen yet.
        </p>
      </div>

      <ul className="admin-section-list">
        <li className="admin-section-list__item">
          <div>
            <h3>Email connection</h3>
            <p>
              Provider: {email.providerLabel ?? "Not configured"} · From: {email.publicFromAddress ?? "—"} · Status:{" "}
              {email.status}
              {email.liveEnabled ? " (live)" : " (not live)"}
            </p>
          </div>
          <span className="admin-badge">{ready ? "Ready" : "Blocked"}</span>
        </li>
        <li className="admin-section-list__item">
          <div>
            <h3>Compose announcement</h3>
            <p>
              {ready
                ? "Connection looks ready — outbound send UI is still not wired. No emails will be sent from this build."
                : "Configure and verify email under Connections before announcement sending can be enabled."}
            </p>
          </div>
          <span className="admin-badge">Unavailable</span>
        </li>
        <li className="admin-section-list__item">
          <div>
            <h3>Audience</h3>
            <p>Parent/guardian lists are not implemented. Do not upload student contact sheets to this repository.</p>
          </div>
          <span className="admin-badge">Unavailable</span>
        </li>
      </ul>
    </div>
  )
}
