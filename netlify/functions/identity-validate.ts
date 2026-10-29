import type { Handler, HandlerContext, HandlerEvent } from "@netlify/functions"
import { PRIVILEGED_ROLE_NAMES } from "./_shared/privilegedRoles.ts"

/**
 * Blocks signup attempts that try to smuggle privileged role claims through
 * user-controlled metadata. Invite-only registration must also be enabled in
 * the Netlify Identity dashboard.
 */
const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  const payload = JSON.parse(event.body || "{}") as {
    user?: {
      user_metadata?: Record<string, unknown>
      app_metadata?: Record<string, unknown>
    }
  }
  const userMeta = payload.user?.user_metadata ?? {}
  const appMeta = payload.user?.app_metadata ?? {}

  const claimed = [
    userMeta.role,
    userMeta.roles,
    appMeta.role,
    appMeta.roles,
  ].flatMap((value) => {
    if (typeof value === "string") return [value]
    if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string")
    return []
  })

  if (claimed.some((role) => PRIVILEGED_ROLE_NAMES.includes(role))) {
    return {
      statusCode: 403,
      body: "Public registration cannot assign staff roles.",
    }
  }

  return { statusCode: 204 }
}

export { handler }
