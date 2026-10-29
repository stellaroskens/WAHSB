import type { ReactNode } from "react"

export type HeroScene =
  | "club"
  | "practices"
  | "tournaments"
  | "sponsors"
  | "fundraisers"
  | "bowlathon"
  | "resources"
  | "faq"
  | "contact"
  | "gear"
  | "team"
  | "admin"
  | "privacy"
  | "photos"

type AthleticHeroProps = {
  scene: HeroScene
  headingId?: string
  eyebrow?: string
  /** Large display line. Keep the page's existing heading words. */
  title: ReactNode
  /** Second display line inside the h1, under the large title. */
  subtitle?: ReactNode
  children?: ReactNode
  actions?: ReactNode
  art?: ReactNode
}

export function AthleticHero({
  scene,
  headingId,
  eyebrow,
  title,
  subtitle,
  children,
  actions,
  art,
}: AthleticHeroProps) {
  return (
    <header className={`ah ah--${scene}${art ? " ah--has-art" : ""}`}>
      <div className="ah__scene" aria-hidden="true">
        <span className="ah__photo" />
        <span className="ah__streak ah__streak--red" />
        <span className="ah__streak ah__streak--blue" />
        <span className="ah__lanes" />
      </div>
      <div className="ah__inner">
        <div className="ah__copy">
          {eyebrow ? <p className="ah__eyebrow">{eyebrow}</p> : null}
          <h1 id={headingId} className="ah__title">
            <span className="ah__title-main">{title}</span>
            {subtitle ? <> <span className="ah__title-sub">{subtitle}</span></> : null}
          </h1>
          {children ? <div className="ah__lead">{children}</div> : null}
          {actions ? <div className="ah__actions">{actions}</div> : null}
        </div>
        {art ? <div className="ah__art">{art}</div> : null}
      </div>
    </header>
  )
}

type SectionHeadingProps = {
  id?: string
  as?: "h2" | "h3"
  title: ReactNode
  children?: ReactNode
  align?: "start" | "center"
}

export function SectionHeading({ id, as = "h2", title, children, align = "start" }: SectionHeadingProps) {
  const Tag = as
  return (
    <div className={`sw-heading${align === "center" ? " sw-heading--center" : ""}`}>
      <Tag id={id} className="sw-heading__title">
        {title}
      </Tag>
      {children ? <div className="sw-heading__intro">{children}</div> : null}
    </div>
  )
}
