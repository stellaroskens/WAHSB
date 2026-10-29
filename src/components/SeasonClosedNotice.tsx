import { Link } from "react-router-dom"
import { seasonRegistrationClosed } from "../content/site"

type SeasonClosedNoticeProps = {
  /** Include the VOLUNTEER OPPORTUNITIES button. Default true. */
  showVolunteerCta?: boolean
  /** Extra class on the wrapper for page-specific layout. */
  className?: string
  /** Heading element id for aria-labelledby. */
  headingId?: string
}

/**
 * Shared 2026–2027 student registration closed notice.
 * Volunteer CTA stays available; student join/signup CTAs do not.
 */
export function SeasonClosedNotice({
  showVolunteerCta = true,
  className,
  headingId = "season-registration-closed-heading",
}: SeasonClosedNoticeProps) {
  const { heading, description, volunteerSecondary, volunteerCtaLabel, volunteerCtaTo } =
    seasonRegistrationClosed

  return (
    <div className={className}>
      <h2 id={headingId}>{heading}</h2>
      <p>{description}</p>
      <p>{volunteerSecondary}</p>
      {showVolunteerCta ? (
        <p>
          <Link className="sw-btn" to={volunteerCtaTo}>
            {volunteerCtaLabel}
          </Link>
        </p>
      ) : null}
    </div>
  )
}
