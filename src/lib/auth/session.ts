import type { User } from "@netlify/identity"
import { isSuperAdmin, primaryStaffRole, type StaffRole } from "./roles.ts"

export type AdminSession =
  | { ok: true; email: string; id: string; roles: string[] }
  | { ok: false; reason: "unauthorized" | "forbidden" | "unavailable" }

export type StaffSession =
  | {
      ok: true
      email: string
      id: string
      roles: string[]
      primaryRole: StaffRole
      username: string | null
    }
  | { ok: false; reason: "unauthorized" | "forbidden" | "unavailable" }

export function rolesFromUser(user: User | null | undefined): string[] {
  if (!user) return []
  if (Array.isArray(user.roles) && user.roles.length > 0) return user.roles
  const metaRoles = user.appMetadata?.roles
  return Array.isArray(metaRoles) ? metaRoles.filter((role): role is string => typeof role === "string") : []
}

export function usernameFromUser(user: User | null | undefined): string | null {
  if (!user) return null
  const value = user.userMetadata?.username
  return typeof value === "string" && value.trim() ? value.trim() : null
}

export function toAdminSession(user: User | null): AdminSession {
  if (!user) return { ok: false, reason: "unauthorized" }
  const roles = rolesFromUser(user)
  if (!isSuperAdmin(roles)) return { ok: false, reason: "forbidden" }
  return {
    ok: true,
    id: user.id,
    email: user.email ?? "",
    roles,
  }
}

/** Verify privileged access with the Netlify Function — never trust browser-only state. */
export async function fetchAdminSession(): Promise<AdminSession> {
  try {
    const response = await fetch("/api/admin/session", {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    })
    if (response.status === 401) return { ok: false, reason: "unauthorized" }
    if (response.status === 403) return { ok: false, reason: "forbidden" }
    if (response.status === 503) return { ok: false, reason: "unavailable" }
    if (!response.ok) return { ok: false, reason: "unavailable" }
    const data = (await response.json()) as { email?: string; id?: string; roles?: string[] }
    if (!data.id || !isSuperAdmin(data.roles)) return { ok: false, reason: "forbidden" }
    return {
      ok: true,
      id: data.id,
      email: data.email ?? "",
      roles: Array.isArray(data.roles) ? data.roles : [],
    }
  } catch {
    return { ok: false, reason: "unavailable" }
  }
}

export async function fetchStaffSession(): Promise<StaffSession> {
  try {
    const response = await fetch("/api/staff/session", {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    })
    if (response.status === 401) return { ok: false, reason: "unauthorized" }
    if (response.status === 403) return { ok: false, reason: "forbidden" }
    if (response.status === 503) return { ok: false, reason: "unavailable" }
    if (!response.ok) return { ok: false, reason: "unavailable" }
    const data = (await response.json()) as {
      email?: string
      id?: string
      roles?: string[]
      primaryRole?: StaffRole
      username?: string | null
    }
    const primaryRole = data.primaryRole ?? primaryStaffRole(data.roles)
    if (!data.id || !primaryRole) return { ok: false, reason: "forbidden" }
    return {
      ok: true,
      id: data.id,
      email: data.email ?? "",
      roles: Array.isArray(data.roles) ? data.roles : [],
      primaryRole,
      username: data.username ?? null,
    }
  } catch {
    return { ok: false, reason: "unavailable" }
  }
}
