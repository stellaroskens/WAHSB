import { Link } from "react-router-dom"
import { PageMeta } from "../../components/PageMeta"
import { useAuth } from "../../lib/auth/AuthProvider"
import { SUPER_ADMIN_ROLE } from "../../lib/auth/roles"
import { FAMILY_ACCESS_OPEN, FAMILY_TEST_PROCEDURE, FAMILY_TEST_READY } from "../../lib/family/familyAccess"
import { rolesFromUser, usernameFromUser } from "../../lib/auth/session"

export function AdminSettings() {
  const { user } = useAuth()
  const roles = rolesFromUser(user)
  const username = usernameFromUser(user)

  return (
    <div className="admin-page">
      <PageMeta
        title="Admin Settings | Albany High School Bowling"
        description="Administrator account settings for Albany High School Bowling."
      />
      <div className="admin-page__intro">
        <h2>Site settings</h2>
        <p>Shared content is edited in Website Pages. This screen shows the signed-in account and where those settings live.</p>
        <p>
          <Link to="/admin/content?page=home">Navigation and registration notice</Link>
          {" · "}
          <Link to="/admin/content?page=practices">Practice location</Link>
          {" · "}
          <Link to="/admin/content?page=volunteer">Volunteer links</Link>
          {" · "}
          <Link to="/admin/staff">Staff accounts</Link>
          {" · "}
          <Link to="/admin/content?page=meet-the-bowlers">Meet the Bowlers</Link>
        </p>
      </div>
      <dl className="admin-settings">
        <div>
          <dt>Signed in as</dt>
          <dd>{user?.email ?? "Unknown"}</dd>
        </div>
        <div>
          <dt>Username (display only)</dt>
          <dd>{username ?? "Not set — usernames are never proof of identity"}</dd>
        </div>
        <div>
          <dt>Required role</dt>
          <dd>
            <code>{SUPER_ADMIN_ROLE}</code>
          </dd>
        </div>
        <div>
          <dt>Roles on this session</dt>
          <dd>{roles.length ? roles.join(", ") : "None"}</dd>
        </div>
        <div>
          <dt>Family access test</dt>
          <dd>
            {FAMILY_ACCESS_OPEN || FAMILY_TEST_READY
              ? "Family access is open."
              : "Not ready. No invitation is sent, and no email address is stored here."}
            <ol>
              {FAMILY_TEST_PROCEDURE.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </dd>
        </div>
        <div>
          <dt>Multi-factor authentication</dt>
          <dd>
            Not provided by Netlify Identity for app users. Plan MFA via Auth0 or another supported provider before
            expanding privileged access.
          </dd>
        </div>
      </dl>
    </div>
  )
}
