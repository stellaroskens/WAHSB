import { useEffect, useRef, useState, type FormEvent } from "react"
import { club } from "../../content/site"
import { useAuth } from "../../lib/auth/AuthProvider"
import {
  RECOVERY_RATE_LIMIT_COOLDOWN_SECONDS,
  RECOVERY_REQUESTED,
  recoveryHelpText,
  recoveryOutcomeFromError,
  type RecoveryOutcome,
} from "../../lib/auth/recovery"

const VARIANTS = {
  admin: {
    form: "admin-form",
    button: "admin-btn",
    back: "admin-btn admin-btn--ghost",
    alert: "admin-alert",
    alertError: "admin-alert admin-alert--error",
    help: "admin-help",
  },
  public: {
    form: "signin-form",
    button: "button button-primary signin-submit",
    back: "signin-link",
    alert: "signin-alert",
    alertError: "signin-alert signin-alert--error",
    help: "signin-help",
  },
} as const

// Kept in memory for this page visit so leaving and reopening the form does not reset the lock.
const requestedEmails = new Set<string>()
let rateLimitedUntil: number | null = null

type Props = {
  variant: keyof typeof VARIANTS
  initialEmail?: string
  onBack: () => void
}

export function PasswordRecoveryForm({ variant, initialEmail = "", onBack }: Props) {
  const { requestRecovery } = useAuth()
  const styles = VARIANTS[variant]
  const [email, setEmail] = useState(initialEmail)
  const [busy, setBusy] = useState(false)
  const [outcome, setOutcome] = useState<RecoveryOutcome | null>(null)
  const [requested, setRequested] = useState(() => new Set(requestedEmails))
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(() =>
    rateLimitedUntil && rateLimitedUntil > Date.now() ? rateLimitedUntil : null,
  )
  const [now, setNow] = useState(() => Date.now())
  // State updates are async, so a ref is what actually blocks a second click in the same tick.
  const inFlight = useRef(false)

  useEffect(() => {
    if (!cooldownUntil) return
    const timer = window.setInterval(() => {
      const current = Date.now()
      setNow(current)
      if (current >= cooldownUntil) {
        setCooldownUntil(null)
        window.clearInterval(timer)
      }
    }, 1000)
    return () => window.clearInterval(timer)
  }, [cooldownUntil])

  const normalizedEmail = email.trim().toLowerCase()
  const alreadyRequested = requested.has(normalizedEmail)
  const secondsLeft = cooldownUntil ? Math.max(0, Math.ceil((cooldownUntil - now) / 1000)) : 0
  const locked = busy || alreadyRequested || secondsLeft > 0

  function markRequested() {
    requestedEmails.add(normalizedEmail)
    setRequested(new Set(requestedEmails))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (inFlight.current || locked) return
    inFlight.current = true
    setBusy(true)
    setOutcome(null)
    try {
      await requestRecovery(email)
      setOutcome({ kind: "requested", message: RECOVERY_REQUESTED })
      markRequested()
    } catch (err) {
      const next = recoveryOutcomeFromError(err)
      setOutcome(next)
      if (next.kind === "requested") markRequested()
      if (next.kind === "rate_limited") {
        const start = Date.now()
        rateLimitedUntil = start + RECOVERY_RATE_LIMIT_COOLDOWN_SECONDS * 1000
        setNow(start)
        setCooldownUntil(rateLimitedUntil)
      }
    } finally {
      inFlight.current = false
      setBusy(false)
    }
  }

  const buttonLabel = busy
    ? "Sending…"
    : alreadyRequested
      ? "Recovery email requested"
      : secondsLeft > 0
        ? `Try again in ${secondsLeft}s`
        : "Send recovery link"

  return (
    <form className={styles.form} onSubmit={onSubmit} aria-busy={busy}>
      <p className={styles.help}>
        Enter your staff email. If it belongs to an approved account, Netlify will email you a reset link.
      </p>
      {outcome ? (
        <p
          className={outcome.kind === "requested" ? styles.alert : styles.alertError}
          role={outcome.kind === "requested" ? "status" : "alert"}
        >
          {outcome.message}
        </p>
      ) : null}
      <label>
        Email
        <input
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <button className={styles.button} type="submit" disabled={locked}>
        {buttonLabel}
      </button>
      <button className={styles.back} type="button" onClick={onBack}>
        Back to sign in
      </button>
      <p className={styles.help}>{recoveryHelpText(club.email)}</p>
    </form>
  )
}
