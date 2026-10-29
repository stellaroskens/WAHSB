import type { Handler, HandlerContext, HandlerEvent } from "@netlify/functions"
import { PRIVILEGED_ROLE_NAMES } from "./_shared/privilegedRoles.ts"

/**
 * Identity lifecycle hook (legacy filename convention).
 * Never auto-assigns privileged roles. Roles are set only via the Netlify
 * Identity dashboard or authenticated admin API after a real invitation.
 */
const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  const payload = JSON.parse(event.body || "{}") as {
    user?: {
      app_metadata?: Record<string, unknown>
      user_metadata?: Record<string, unknown>
    }
  }
  const user = payload.user ?? {}
  const existingApp = user.app_metadata ?? {}
  const incomingRoles = Array.isArray(existingApp.roles)
    ? existingApp.roles.filter((role): role is string => typeof role === "string")
    : []

  const safeRoles = incomingRoles.filter(
    (role) => !(PRIVILEGED_ROLE_NAMES as readonly string[]).includes(role),
  )

  return {
    statusCode: 200,
    body: JSON.stringify({
      app_metadata: {
        ...existingApp,
        roles: safeRoles,
      },
      user_metadata: user.user_metadata ?? {},
    }),
  }
}

export { handler }
