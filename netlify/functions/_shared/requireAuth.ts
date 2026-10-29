import { getUser, type User } from "@netlify/identity"
import { isSuperAdmin, parseEmailAllowlist, rolesFromUser, type StaffRole } from "./roles.ts"
import { decideStaffAccess } from "./staffAccess.ts"

declare const Netlify: {
  env: {
    get(name: string): string | undefined
  }
}

export function isAdminAuthEnabledServer(): boolean {
  return Netlify.env.get("ADMIN_AUTH_ENABLED") === "true"
}

export function getAdminEmailAllowlist(): string[] {
  return parseEmailAllowlist(Netlify.env.get("ADMIN_EMAIL_ALLOWLIST"))
}

function json(status: number, body: Record<string, unknown>): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  })
}

export type AuthFailure = { ok: false; response: Response }
export type AuthSuccess = {
  ok: true
  user: User
  roles: string[]
  email: string
  primaryRole: StaffRole
}
export type AuthResult = AuthSuccess | AuthFailure

export async function requireEnabledStaffAuth(): Promise<AuthResult | AuthFailure> {
  if (!isAdminAuthEnabledServer()) {
    return {
      ok: false,
      response: json(503, {
        error: "unavailable",
        message: "Administrator authentication is not enabled.",
        code: "admin_auth_disabled",
      }),
    }
  }

  const user = await getUser()
  if (!user) {
    return {
      ok: false,
      response: json(401, { error: "unauthorized", message: "Sign in required." }),
    }
  }

  const roles = rolesFromUser(user)
  const email = user.email ?? ""
  // Super admins must be on the allowlist (empty fails closed). Other staff are invite-managed.
  const decision = decideStaffAccess({ roles, email, allowlist: getAdminEmailAllowlist() })
  if (!decision.ok) {
    return {
      ok: false,
      response: json(403, { error: "forbidden", code: decision.code, message: decision.message }),
    }
  }

  return { ok: true, user, roles, email, primaryRole: decision.primaryRole }
}

export async function requireSuperAdmin(): Promise<AuthResult> {
  const result = await requireEnabledStaffAuth()
  if (!result.ok) return result
  if (!isSuperAdmin(result.roles)) {
    return {
      ok: false,
      response: json(403, { error: "forbidden", message: "super_admin role required." }),
    }
  }
  return result
}

export async function requireRole(required: StaffRole | StaffRole[]): Promise<AuthResult> {
  const needed = Array.isArray(required) ? required : [required]
  const result = await requireEnabledStaffAuth()
  if (!result.ok) return result
  if (isSuperAdmin(result.roles)) return result
  if (!needed.some((role) => result.roles.includes(role))) {
    return {
      ok: false,
      response: json(403, { error: "forbidden", message: `Required role: ${needed.join(" or ")}.` }),
    }
  }
  return result
}
