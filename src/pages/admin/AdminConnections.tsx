import { useEffect, useState, type FormEvent } from "react"
import { PageMeta } from "../../components/PageMeta"
import { useAuth } from "../../lib/auth/AuthProvider"
import { hasPermission } from "../../lib/auth/permissions"
import {
  parseSiteConnections,
  validateSiteConnections,
  type ConnectionStatus,
  type SiteConnectionsConfig,
} from "../../lib/content/siteConnectionsModel"
import { rolesFromUser } from "../../lib/auth/session"
import published from "../../content/published/siteConnections.json"

const STATUS_OPTIONS: ConnectionStatus[] = ["disabled", "prepared", "verified"]

export function AdminConnections() {
  const { user } = useAuth()
  const roles = rolesFromUser(user)
  const canApprove = hasPermission(roles, "manage_payments")
  const [config, setConfig] = useState<SiteConnectionsConfig>(() => parseSiteConnections(published))
  const [githubConfigured, setGithubConfigured] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const response = await fetch("/api/admin/connections", { credentials: "include" })
        const body = (await response.json()) as {
          connections?: SiteConnectionsConfig
          githubConfigured?: boolean
          error?: string
          note?: string
        }
        if (!response.ok) throw new Error(body.error || "Unable to load connections.")
        if (!cancelled && body.connections) {
          setConfig(parseSiteConnections(body.connections))
          setGithubConfigured(Boolean(body.githubConfigured))
          if (body.note) setMessage(body.note)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load connections.")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const onSave = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)
    const issues = validateSiteConnections(config)
    if (issues.length) {
      setError(issues.map((issue) => `${issue.path}: ${issue.message}`).join(" "))
      setBusy(false)
      return
    }
    try {
      const response = await fetch("/api/admin/connections", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ connections: config }),
      })
      const body = (await response.json()) as {
        error?: string
        note?: string
        connections?: SiteConnectionsConfig
        issues?: { path: string; message: string }[]
      }
      if (!response.ok) {
        if (body.issues?.length) {
          throw new Error(body.issues.map((issue) => `${issue.path}: ${issue.message}`).join(" "))
        }
        throw new Error(body.error || "Save failed.")
      }
      if (body.connections) setConfig(parseSiteConnections(body.connections))
      setMessage(body.note || "Connections saved.")
      setGithubConfigured(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-page">
      <PageMeta
        title="Connections | Albany High School Bowling"
        description="Prepare social, email, and payment connections for Albany High School Bowling."
      />
      <div className="admin-page__intro">
        <h2>Connections</h2>
        <p>
          Prepare public destinations for Stripe, PayPal, Venmo, Cash App, email, and social links. Never enter
          passwords, API secrets, or private financial credentials here. Every payment option stays disabled until a
          super_admin marks it verified and enables it live.
        </p>
        <p>
          GitHub save: {githubConfigured ? "configured" : "not configured yet (GITHUB_CONTENT_TOKEN)"}.
        </p>
      </div>

      {error && (
        <p className="admin-alert admin-alert--error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="admin-alert" role="status">
          {message}
        </p>
      )}

      <form className="admin-panel-form" onSubmit={onSave}>
        <h3>Payment destinations</h3>
        <p className="admin-help">
          Public checkout URLs or @handles only. Live checkout remains off until verified + enabled
          {canApprove ? "." : " (super_admin only)."}
        </p>
        {config.payments.map((payment, index) => (
          <fieldset key={payment.id} className="admin-fieldset">
            <legend>{payment.label}</legend>
            <label>
              Public destination
              <input
                value={payment.publicDestination ?? ""}
                onChange={(event) => {
                  const value = event.target.value.trim() || null
                  setConfig((current) => ({
                    ...current,
                    payments: current.payments.map((item, i) =>
                      i === index ? { ...item, publicDestination: value } : item,
                    ),
                  }))
                }}
                placeholder="https://… or @handle"
                autoComplete="off"
              />
            </label>
            <label>
              Staff note (non-secret)
              <input
                value={payment.staffNote ?? ""}
                onChange={(event) => {
                  const value = event.target.value.trim() || null
                  setConfig((current) => ({
                    ...current,
                    payments: current.payments.map((item, i) =>
                      i === index ? { ...item, staffNote: value } : item,
                    ),
                  }))
                }}
              />
            </label>
            <label>
              Status
              <select
                value={payment.status}
                onChange={(event) => {
                  const status = event.target.value as ConnectionStatus
                  setConfig((current) => ({
                    ...current,
                    payments: current.payments.map((item, i) =>
                      i === index
                        ? {
                            ...item,
                            status: canApprove ? status : status === "verified" ? "prepared" : status,
                            liveEnabled:
                              canApprove && status === "verified" ? item.liveEnabled : false,
                          }
                        : item,
                    ),
                  }))
                }}
              >
                {STATUS_OPTIONS.filter((status) => canApprove || status !== "verified").map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={payment.liveEnabled}
                disabled={!canApprove || payment.status !== "verified"}
                onChange={(event) => {
                  const liveEnabled = event.target.checked
                  setConfig((current) => ({
                    ...current,
                    payments: current.payments.map((item, i) =>
                      i === index ? { ...item, liveEnabled } : item,
                    ),
                  }))
                }}
              />
              Live enabled (super_admin + verified only)
            </label>
          </fieldset>
        ))}

        <h3>Email service</h3>
        <p className="admin-help">Display/provider labels only — no SMTP passwords or API keys.</p>
        <label>
          Provider label
          <input
            value={config.email.providerLabel ?? ""}
            onChange={(event) =>
              setConfig((current) => ({
                ...current,
                email: { ...current.email, providerLabel: event.target.value.trim() || null },
              }))
            }
            placeholder="e.g. Not configured"
          />
        </label>
        <label>
          Public from address
          <input
            type="email"
            value={config.email.publicFromAddress ?? ""}
            onChange={(event) =>
              setConfig((current) => ({
                ...current,
                email: { ...current.email, publicFromAddress: event.target.value.trim() || null },
              }))
            }
            placeholder="club@example.com"
            autoComplete="off"
          />
        </label>
        <label>
          Status
          <select
            value={config.email.status}
            onChange={(event) => {
              const status = event.target.value as ConnectionStatus
              setConfig((current) => ({
                ...current,
                email: {
                  ...current.email,
                  status: canApprove ? status : status === "verified" ? "prepared" : status,
                  liveEnabled: canApprove && status === "verified" ? current.email.liveEnabled : false,
                },
              }))
            }}
          >
            {STATUS_OPTIONS.filter((status) => canApprove || status !== "verified").map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-check">
          <input
            type="checkbox"
            checked={config.email.liveEnabled}
            disabled={!canApprove || config.email.status !== "verified"}
            onChange={(event) =>
              setConfig((current) => ({
                ...current,
                email: { ...current.email, liveEnabled: event.target.checked },
              }))
            }
          />
          Live enabled (super_admin + verified only)
        </label>
        <label>
          Staff note
          <input
            value={config.email.staffNote ?? ""}
            onChange={(event) =>
              setConfig((current) => ({
                ...current,
                email: { ...current.email, staffNote: event.target.value.trim() || null },
              }))
            }
          />
        </label>

        <h3>Social media</h3>
        {config.social.map((network, index) => (
          <fieldset key={network.id} className="admin-fieldset">
            <legend>{network.label}</legend>
            <label>
              Public URL
              <input
                value={network.publicUrl ?? ""}
                onChange={(event) => {
                  const value = event.target.value.trim() || null
                  setConfig((current) => ({
                    ...current,
                    social: current.social.map((item, i) =>
                      i === index ? { ...item, publicUrl: value } : item,
                    ),
                  }))
                }}
                placeholder="https://…"
                autoComplete="off"
              />
            </label>
            <label>
              Status
              <select
                value={network.status}
                onChange={(event) => {
                  const status = event.target.value as ConnectionStatus
                  setConfig((current) => ({
                    ...current,
                    social: current.social.map((item, i) =>
                      i === index
                        ? {
                            ...item,
                            status: canApprove ? status : status === "verified" ? "prepared" : status,
                            liveEnabled: canApprove && status === "verified" ? item.liveEnabled : false,
                          }
                        : item,
                    ),
                  }))
                }}
              >
                {STATUS_OPTIONS.filter((status) => canApprove || status !== "verified").map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={network.liveEnabled}
                disabled={!canApprove || network.status !== "verified"}
                onChange={(event) => {
                  const liveEnabled = event.target.checked
                  setConfig((current) => ({
                    ...current,
                    social: current.social.map((item, i) =>
                      i === index ? { ...item, liveEnabled } : item,
                    ),
                  }))
                }}
              />
              Live enabled (super_admin + verified only)
            </label>
          </fieldset>
        ))}

        <button className="admin-btn" type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save connections"}
        </button>
      </form>
    </div>
  )
}
