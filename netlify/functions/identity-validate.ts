import type { Handler, HandlerContext, HandlerEvent } from "@netlify/functions"
import { PRIVILEGED_ROLE_NAMES } from "./_shared/privilegedRoles.ts"
import { deniedHook } from "./_shared/requireAuth.ts"

/**
 * Blocks signup attempts that try to smuggle privileged role claims through
 * user-controlled metadata. Invite-only registration must also be enabled in
 * the Netlify Identity dashboard.
 */
const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  let payload: {
    user?: {
      user_metadata?: Record<string, unknown>
      app_metadata?: Record<string, unknown>
    }
  }
  try {
    const parsed = JSON.parse(event.body || "{}") as unknown
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return deniedHook(400, "The identity event was not valid. No role was assigned.", "invalid_identity_event")
    }
    payload = parsed as typeof payload
  } catch {
    return deniedHook(400, "The identity event was not valid. No role was assigned.", "invalid_identity_event")
  }
  const record = payload.user
  const user = record && typeof record === "object" ? record : {}
  const userMeta = user.user_metadata && typeof user.user_metadata === "object" ? user.user_metadata : {}
  const appMeta = user.app_metadata && typeof user.app_metadata === "object" ? user.app_metadata : {}

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
    return deniedHook(403, "Public registration cannot assign staff roles.", "forbidden")
  }

  return { statusCode: 204 }
}

export { handler }
