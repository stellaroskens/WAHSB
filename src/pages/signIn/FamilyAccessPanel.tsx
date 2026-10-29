import { Link } from "react-router-dom"
import { FAMILY_ACCESS_PENDING_MESSAGE, FAMILY_INVITE_WORKFLOW } from "../../lib/family/familyAccess"

export function FamilyAccessPanel() {
  return (
    <div>
      <p className="signin-alert" role="status">
        {FAMILY_ACCESS_PENDING_MESSAGE}
      </p>
      <h3 className="signin-subhead">How family access will work</h3>
      <ul className="signin-steps">
        {FAMILY_INVITE_WORKFLOW.slice(3, 8).map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ul>
      <p className="signin-help">
        Until then, everything families need is public: <Link to="/practices">practices</Link>,{" "}
        <Link to="/tournaments">tournaments</Link>, <Link to="/resources">resources</Link>, and the{" "}
        <Link to="/faq">FAQ</Link>. <Link to="/family">See what the family page will include.</Link>
      </p>
    </div>
  )
}
