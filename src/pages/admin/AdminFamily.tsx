import { Link } from "react-router-dom"
import { PageMeta } from "../../components/PageMeta"
import {
  FAMILY_ACCESS_OPEN,
  FAMILY_ACCESS_PENDING_MESSAGE,
  FAMILY_ACCESS_PREREQUISITES,
  FAMILY_DASHBOARD_PLANNED,
  FAMILY_INVITE_WORKFLOW,
} from "../../lib/family/familyAccess"

export function AdminFamily() {
  return (
    <div className="admin-page">
      <PageMeta
        title="Family Account Management | Albany High School Bowling"
        description="Closed family account preparation for Albany High School Bowling."
      />
      <div className="admin-page__intro">
        <h2>Family Account Management</h2>
        <p>{FAMILY_ACCESS_PENDING_MESSAGE}</p>
        <p>
          Family access is {FAMILY_ACCESS_OPEN ? "open" : "closed"}. This page does not create an account, send an
          invitation, or store a guardian email, household, or student relationship.
        </p>
        <p>
          <Link to="/admin">Return to Main Admin Dashboard</Link>
        </p>
      </div>
      <h3>Required before any family account opens</h3>
      <ul className="admin-section-list">
        {FAMILY_ACCESS_PREREQUISITES.map((item) => (
          <li key={item} className="admin-section-list__item">
            <div>
              <h3>{item}</h3>
            </div>
            <span className="admin-badge">Not ready</span>
          </li>
        ))}
      </ul>
      <h3>Invitation workflow</h3>
      <ol>
        {FAMILY_INVITE_WORKFLOW.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <h3>Planned household tools</h3>
      <ul className="admin-section-list">
        {FAMILY_DASHBOARD_PLANNED.map((item) => (
          <li key={item.title} className="admin-section-list__item">
            <div>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </div>
            <span className="admin-badge">Closed</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
