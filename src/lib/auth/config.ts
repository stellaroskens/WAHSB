/**
 * Client-visible feature gate for the staff login UI.
 * Secrets must never live in VITE_* variables — this flag only unlocks the form.
 * Enable in Netlify env only after Identity is invite-only and the first admin is ready.
 */
export function isAdminAuthUiEnabled(): boolean {
  return import.meta.env.VITE_ADMIN_AUTH_ENABLED === "true"
}
