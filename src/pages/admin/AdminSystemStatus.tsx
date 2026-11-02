import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { PageMeta } from "../../components/PageMeta"
import type { SystemStatusReport } from "../../lib/admin/systemStatus"

export function AdminSystemStatus() {
  const [report, setReport] = useState<SystemStatusReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const response = await fetch("/api/admin/system-status", { credentials: "include" })
      const body = (await response.json().catch(() => ({ error: "System status could not be reached." }))) as
        | SystemStatusReport
        | { error?: string }
      if (!response.ok || !("githubPublishing" in body)) {
        setError("error" in body && body.error ? body.error : "System status could not be loaded.")
        return
      }
      setReport(body)
    })()
  }, [])

  return (
    <div className="admin-page">
      <PageMeta
        title="System Status | Albany High School Bowling"
        description="Setup status for Albany High School Bowling. Secrets are not shown."
      />
      <div className="admin-page__intro">
        <h2>System Status and Setup</h2>
        <p>This page reports whether a service is configured. It does not show tokens, passwords, or API keys, and it does not turn a service on.</p>
        <p>
          <Link to="/admin">Return to Main Admin Dashboard</Link>
        </p>
      </div>
      {error ? (
        <p className="admin-alert admin-alert--error" role="alert">
          {error}
        </p>
      ) : null}
      {report ? (
        <>
          <ul className="admin-section-list">
            <li className="admin-section-list__item">
              <div>
                <h3>GitHub publishing</h3>
                <p>{report.githubPublishing.detail}</p>
              </div>
              <span className="admin-badge">{report.githubPublishing.configured ? "Configured" : "Missing"}</span>
            </li>
            <li className="admin-section-list__item">
              <div>
                <h3>Netlify deployment</h3>
                <p>{report.netlifyDeploy.detail}</p>
                <p>
                  <a href={report.netlifyDeploy.href}>Open Netlify deploys</a>
                </p>
              </div>
              <span className="admin-badge">Check Netlify</span>
            </li>
            <li className="admin-section-list__item">
              <div>
                <h3>Authentication</h3>
                <p>{report.authentication.detail}</p>
              </div>
              <span className="admin-badge">{report.authentication.enabled ? "Enabled" : "Off"}</span>
            </li>
            <li className="admin-section-list__item">
              <div>
                <h3>Email</h3>
                <p>
                  Connection status: {report.email.status}. {report.email.detail}
                </p>
              </div>
              <span className="admin-badge">Sending off</span>
            </li>
            <li className="admin-section-list__item">
              <div>
                <h3>Payments</h3>
                <p>
                  {report.payments
                    .map((payment) => `${payment.label}: ${payment.status}${payment.liveEnabled ? ", live" : ""}`)
                    .join(" · ")}
                </p>
                <p>
                  <Link to="/admin/connections">Open payment connections</Link>
                </p>
              </div>
              <span className="admin-badge">Verification required</span>
            </li>
            <li className="admin-section-list__item">
              <div>
                <h3>Private database</h3>
                <p>{report.privateDatabase.detail}</p>
              </div>
              <span className="admin-badge">{report.privateDatabase.wired ? "Connected" : "Not connected"}</span>
            </li>
            <li className="admin-section-list__item">
              <div>
                <h3>Media storage</h3>
                <p>{report.mediaStorage.detail}</p>
              </div>
              <span className="admin-badge">Uploads off</span>
            </li>
            <li className="admin-section-list__item">
              <div>
                <h3>Family access</h3>
                <p>{report.familyAccess.detail}</p>
              </div>
              <span className="admin-badge">{report.familyAccess.open ? "Open" : "Closed"}</span>
            </li>
            <li className="admin-section-list__item">
              <div>
                <h3>Guardian consent</h3>
                <p>{report.guardianConsent.detail}</p>
              </div>
              <span className="admin-badge">{report.guardianConsent.ready ? "Ready" : "Not ready"}</span>
            </li>
          </ul>
          <h3>Pending setup</h3>
          <ul>
            {report.pending.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>Provider dashboards</h3>
          <ul>
            {report.providerLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  )
}
