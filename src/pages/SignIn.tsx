import { useState } from "react"
import { AthleticHero } from "../components/AthleticHero"
import { PageMeta } from "../components/PageMeta"
import { FamilyAccessPanel } from "./signIn/FamilyAccessPanel"
import { StaffSignInPanel } from "./signIn/StaffSignInPanel"

type AccessOption = "staff" | "family"

const OPTIONS: { id: AccessOption; label: string; summary: string }[] = [
  {
    id: "staff",
    label: "Staff Login",
    summary: "For approved coaches, team administrators, and website administrators.",
  },
  {
    id: "family",
    label: "Family Login",
    summary: "For verified parents and guardians listed on the approved team roster.",
  },
]

export function SignIn() {
  const [active, setActive] = useState<AccessOption>("staff")

  return (
    <div className="sw-page">
      <PageMeta
        title="Team & Family Login | Albany High School Bowling"
        description="Secure, invitation-only sign-in for approved Albany High School Bowling coaches, team administrators, and families."
      />
      <AthleticHero
        scene="team"
        eyebrow="Invitation only"
        title="Team & Family Login"
        subtitle="Secure access for approved coaches, team administrators, and Albany High School Bowling families."
      >
        <p>Every public page on this site still works without an account.</p>
      </AthleticHero>

      <section className="section signin">
        <div className="wrap signin__wrap">
          <div className="signin__tabs" role="tablist" aria-label="Choose how to sign in">
            {OPTIONS.map((option) => (
              <button
                key={option.id}
                id={`signin-tab-${option.id}`}
                className={`signin__tab signin__tab--${option.id}`}
                type="button"
                role="tab"
                aria-selected={active === option.id}
                aria-controls={`signin-panel-${option.id}`}
                onClick={() => setActive(option.id)}
              >
                <span className="signin__tab-label">{option.label}</span>
                <span className="signin__tab-summary">{option.summary}</span>
              </button>
            ))}
          </div>

          {OPTIONS.map((option) => (
            <div
              key={option.id}
              id={`signin-panel-${option.id}`}
              className="sw-panel signin__panel"
              role="tabpanel"
              aria-labelledby={`signin-tab-${option.id}`}
              hidden={active !== option.id}
            >
              <h2 className="signin__panel-title">{option.label}</h2>
              {option.id === "staff" ? <StaffSignInPanel /> : <FamilyAccessPanel />}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
