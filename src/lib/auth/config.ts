/**
 * Client-visible feature gate for the staff login UI.
 * Secrets must never live in VITE_* variables — this flag only unlocks the form.
 * Enable in Netlify env only after Identity is invite-only and the first admin is ready.
 *
 * Unset / any value other than the exact string "true" keeps the UI closed.
 * Do not hardcode this flag in netlify.toml — that file overrides Netlify UI env vars.
 */
export function parseAdminAuthUiFlag(value: string | undefined): boolean {
  return value === "true"
}

export function isAdminAuthUiEnabled(): boolean {
  return parseAdminAuthUiFlag(import.meta.env.VITE_ADMIN_AUTH_ENABLED)
}
