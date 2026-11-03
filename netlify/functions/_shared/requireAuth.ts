import type { Context } from "@netlify/functions"
import { getUser, type User } from "@netlify/identity"
import {
  isSuperAdmin,
  normalizeEmail,
  parseEmailAllowlist,
  primaryStaffRole,
  rolesFromUser,
  type StaffRole,
} from "./roles.ts"

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

const NO_STORE = { "Cache-Control": "no-store" }

function json(status: number, body: Record<string, unknown>): Response {
  return Response.json(body, { status, headers: NO_STORE })
}

/**
 * The installed Identity helper reads the current function request and takes no argument.
 * Callers still pass the function context so the check is tied to that request.
 * Client headers and JSON bodies are never read here.
 */
export async function readIdentityUser(_context: Context): Promise<User | null> {
  const user = await getUser()
  if (!user?.id) return null
  return user
}

export function deniedResponse(status: 401 | 403, message: string, code: "unauthorized" | "forbidden"): Response {
  return json(status, {
    error: status === 401 ? "unauthorized" : "forbidden",
    message,
    code,
    commitSha: null,
  })
}

export function deniedHook(status: 400 | 403, message: string, code: string) {
  const error = status === 400 ? "bad_request" : "forbidden"
  return {
    statusCode: status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    body: JSON.stringify({ error, message, code, commitSha: null }),
  }
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

function allowlistAllows(email: string): boolean {
  const allowlist = getAdminEmailAllowlist()
  if (allowlist.length === 0) return false
  return allowlist.includes(normalizeEmail(email))
}

export async function requireIdentityUser(context: Context): Promise<{ ok: true; user: User } | AuthFailure> {
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

  const user = await readIdentityUser(context)
  if (!user) {
    return { ok: false, response: deniedResponse(401, "Sign in required.", "unauthorized") }
  }
  return { ok: true, user }
}

export async function requireEnabledStaffAuth(context: Context): Promise<AuthResult> {
  const identity = await requireIdentityUser(context)
  if (!identity.ok) return identity

  const roles = rolesFromUser(identity.user)
  const primaryRole = primaryStaffRole(roles)
  if (!primaryRole) {
    return { ok: false, response: deniedResponse(403, "Staff role required.", "forbidden") }
  }

  const email = identity.user.email ?? ""
  if (!allowlistAllows(email) && primaryRole === "super_admin") {
    return {
      ok: false,
      response: deniedResponse(403, "Account is not allowlisted for administrator access.", "forbidden"),
    }
  }

  return { ok: true, user: identity.user, roles, email, primaryRole }
}

export async function requireSuperAdmin(context: Context): Promise<AuthResult> {
  const result = await requireEnabledStaffAuth(context)
  if (!result.ok) return result
  if (!isSuperAdmin(result.roles)) {
    return { ok: false, response: deniedResponse(403, "super_admin role required.", "forbidden") }
  }
  return result
}

export async function requireRole(context: Context, required: StaffRole | StaffRole[]): Promise<AuthResult> {
  const needed = Array.isArray(required) ? required : [required]
  const result = await requireEnabledStaffAuth(context)
  if (!result.ok) return result
  if (isSuperAdmin(result.roles)) return result
  if (!needed.some((role) => result.roles.includes(role))) {
    return {
      ok: false,
      response: deniedResponse(403, `Required role: ${needed.join(" or ")}.`, "forbidden"),
    }
  }
  return result
}
