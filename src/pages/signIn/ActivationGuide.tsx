import { ACTIVATION_EMAIL_PANEL, ACTIVATION_EMAIL_PANEL_TITLE, ACTIVATION_STEPS } from "../../lib/auth/activation"

export function ActivationGuide() {
  return (
    <>
      <ol className="signin-activate__steps">
        {ACTIVATION_STEPS.map((step) => (
          <li key={step.title}>
            <strong>{step.title}</strong>
            <span>{step.body}</span>
          </li>
        ))}
      </ol>
      <aside className="signin-activate__look" aria-label={ACTIVATION_EMAIL_PANEL_TITLE}>
        <h3>{ACTIVATION_EMAIL_PANEL_TITLE}</h3>
        {ACTIVATION_EMAIL_PANEL.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </aside>
    </>
  )
}
