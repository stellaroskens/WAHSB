# ADMIN GUIDE

Staff administration is invitation-only and **disabled by default** in this release package. Do not enable production auth without owner authorization.

## Roles

| Role | Primary routes | Capabilities (code) |
| --- | --- | --- |
| `super_admin` | `/admin/*` | Staff invites, content publish, connections, settings, announcements UI |
| `coach` | `/coach` | Coach dashboard (scoped; no payments/staff management) |
| `team_administrator` | `/team-administrator` | Team admin dashboard (scoped; no super-admin/payouts) |

Public “Sign in” (`/sign-in`) remains unavailable for family/student accounts.

## Before first use (owner checklist)

Detailed steps live in the Project store doc `ADMIN_PHASE1_SETUP.md`. Summary:

1. Enable Netlify Identity → **Invite only**
2. Invite first super admin; set password (12+)
3. Assign Identity role `super_admin` in the dashboard
4. Set `ADMIN_AUTH_ENABLED`, `VITE_ADMIN_AUTH_ENABLED`, `ADMIN_EMAIL_ALLOWLIST` in the **Netlify UI** (not in `netlify.toml` — file-based env overrides UI values for the same key)
5. Redeploy production so Vite can inline `VITE_ADMIN_AUTH_ENABLED`
6. Optional: `GITHUB_CONTENT_TOKEN` for content editor publish

Until the client flag is exactly `true` in the built bundle, `/staff/login` shows that staff access is not open.

## Admin sections (as coded)

Dashboard sections are defined in `src/lib/auth/adminSections.ts` and include content, connections, announcements, tournaments, settings, and staff accounts. Some announcement/send backends remain unfinished — see announcements UI copy and Project notes (email send backend blocker).

## Connections safety

`/admin/connections` stores **public** URLs/handles and status flags only.

- Secrets / API keys / passwords are rejected by validation
- Payment options stay disabled until verified + live-enabled by super_admin
- Current published file has all payments/social live flags off

## Content editor

- Drafts: `content/drafts/`
- Published: `src/content/published/`
- Publish path uses GitHub API with server-only token
- Tokens must never be placed in `VITE_*` or browser code

See Project store `ADMIN_CONTENT_EDITOR.md`.

## Security expectations for admins

- Do not share invite links in public channels
- Do not grant roles based on typed email alone
- Do not activate payment destinations without verifying the destination URL belongs to the club
- Do not commit student private data into content JSON
