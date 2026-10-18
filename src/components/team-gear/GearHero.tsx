import { websiteLogoTransparent } from "../../content/media"

export function GearHero() {
  return (
    <section className="gear-hero" aria-labelledby="team-gear-title">
      <img className="gear-hero__bg" src="/team-gear/hero-scene.webp" alt="" width={1280} height={720} />
      <span className="gear-hero__glow" aria-hidden="true" />
      <div className="gear-hero__mark">
        <img
          className="gear-hero__logo"
          src={websiteLogoTransparent.src}
          srcSet={websiteLogoTransparent.srcSet}
          sizes="(max-width: 700px) 280px, 34vw"
          width={websiteLogoTransparent.width}
          height={websiteLogoTransparent.height}
          alt="Albany High School Bowling"
        />
      </div>
      <div className="gear-hero__copy">
        <h1 id="team-gear-title">Team Gear</h1>
        <p className="gear-hero__school">Albany High School Bowling</p>
        <p className="gear-hero__tag">Custom Jerseys • Spirit Wear • Personalized Team Merchandise</p>
      </div>
    </section>
  )
}

const stepIcons = [
  <path key="shield" d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />,
  <path key="shirt" d="M8 4 3 7l2 4 2-1v10h10V10l2 1 2-4-5-3c-.5 1.5-2 2.5-4 2.5S8.5 5.5 8 4z" />,
  <path
    key="palette"
    d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.8 1.8-1.7 0-1.2-1-1.6-1-2.6 0-1 .8-1.7 1.8-1.7H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3zM7.5 12h.01M9.5 7.5h.01M14.5 7.5h.01"
  />,
  <path key="person" d="M12 4.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM5 20c0-3.9 3.1-6.5 7-6.5s7 2.6 7 6.5" />,
]

export function GearSteps() {
  const steps = [
    { n: "1", first: "Choose", second: "your logo", href: "#gear-logos" },
    { n: "2", first: "Choose", second: "a design", href: import.meta.env.DEV ? "#gear-style" : "#customize" },
    { n: "3", first: "Pick", second: "your colors", href: "#gear-colors" },
    { n: "4", first: "Add your", second: "name", href: "#gear-personalize" },
  ]
  return (
    <nav className="gear-steps" aria-label="How to customize gear">
      <ol>
        {steps.map((step, index) => (
          <li key={step.n}>
            <a href={step.href}>
              <svg className="gear-steps__icon" viewBox="0 0 24 24" aria-hidden="true">
                <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
                  {stepIcons[index]}
                </g>
              </svg>
              <span className="gear-steps__num">{step.n}</span>
              <span className="gear-steps__label">
                {step.first} <br />
                {step.second}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

const trustIcons = [
  <path key="truck" d="M2 6h12v9H2zM14 9h4l3 3v3h-7zM6 18a1.6 1.6 0 1 0 0-.1M17 18a1.6 1.6 0 1 0 0-.1" />,
  <path
    key="gear"
    d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 0 0-1.7-1L15 3.3h-4l-.4 2.6a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.6 7.6 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.4 7.4 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7.4 7.4 0 0 0 1.7-1l2.5 1 2-3.5z"
  />,
  <path key="pen" d="M4 20l1-4L16 5l3 3L8 19zM14 7l3 3" />,
  <path key="people" d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20c0-3.5 2.7-6 6-6s6 2.5 6 6M12 20c0-3.5 1.8-6 4-6 3.3 0 6 2.5 6 6" />,
]

export function GearTrust() {
  const items = [
    ["Custom team apparel", "High-Quality, Team-Ready Gear"],
    ["Multiple logo options", "Featuring Current AHS Bowling Logos"],
    ["Personalize your gear", "Add Your Name"],
    ["For fans, families & supporters", "Show Your Albany Bowling Pride"],
  ]
  return (
    <section className="gear-trust" aria-label="Team gear notes">
      <ul>
        {items.map(([title, detail], index) => (
          <li key={title}>
            <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
              <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round">
                {trustIcons[index]}
              </g>
            </svg>
            <span>
              <strong>{title}</strong>
              <small>{detail}</small>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
