import { useState, type FormEvent } from "react"
import {
  ACTIVATION_BUTTON,
  ACTIVATION_CONFIRMATION,
  ACTIVATION_LIMITATION,
  ACTIVATION_SUBTITLE,
  ACTIVATION_TITLE,
  requestActivationContinue,
} from "../../lib/auth/activation"
import { GoogleSignInButton } from "../../components/auth/GoogleSignInButton"
import { FUTURE_SIGN_IN_NOTE } from "../../lib/auth/futureSignIn"
import { useAuth } from "../../lib/auth/AuthProvider"
import { ActivationGuide } from "./ActivationGuide"

export function ActivateAccountSection() {
  const { callbackProblem } = useAuth()
  const [email, setEmail] = useState("")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    setMessage(null)
    const result = await requestActivationContinue(email)
    if (result.ok) setMessage(result.message)
    else setError(result.message)
    setBusy(false)
  }

  return (
    <section className="signin-activate" id="activate-account" aria-labelledby="activate-account-title">
      <h2 id="activate-account-title" className="signin-activate__title">
        {ACTIVATION_TITLE}
      </h2>
      <p className="signin-activate__subtitle">{ACTIVATION_SUBTITLE}</p>
      <p>{ACTIVATION_LIMITATION}</p>
      {callbackProblem ? (
        <p className="signin-alert signin-alert--error" role="alert">
          {callbackProblem}
        </p>
      ) : null}
      {error ? (
        <p className="signin-alert signin-alert--error" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="signin-alert" role="status">
          {message}
        </p>
      ) : null}
      <form className="signin-form" onSubmit={onSubmit}>
        <label>
          Approved email address
          <input
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <button className="button button-primary signin-submit" type="submit" disabled={busy}>
          {busy ? "Checking…" : ACTIVATION_BUTTON}
        </button>
      </form>
      <p className="signin-help">
        This form is for approved staff whose invitation was already sent by an administrator. It does not request a
        family account. {ACTIVATION_CONFIRMATION}
      </p>
      <ActivationGuide />
      <GoogleSignInButton />
      <p className="signin-help">{FUTURE_SIGN_IN_NOTE}</p>
    </section>
  )
}
