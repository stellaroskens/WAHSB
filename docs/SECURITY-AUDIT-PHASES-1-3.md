# SECURITY AUDIT — Phases 1–3 (read-only review + safe notes)

Audit performed against repository tree starting at `51fb292`, plus client-readiness edits on `audit/wahsb-client-readiness`. This document records **code and header evidence**. It does **not** claim Netlify Identity production configuration status.

## Scope

- Phase 1 admin foundations
- Phase 2 staff accounts / roles
- Phase 3 content editor
- Related connections / announcements surfaces
- Public headers and secret-handling patterns

## Findings (evidence-based)

### Strengths

1. **Auth feature-gated off by default** — client requires exact `VITE_ADMIN_AUTH_ENABLED=true` (unset stays off; do not hardcode in `netlify.toml` because toml overrides UI); server checks `ADMIN_AUTH_ENABLED`.
2. **Role + allowlist model** — Super-admin access requires Identity role; allowlist fails closed when empty (`requireAuth.ts`). Email typed in a form is not sufficient.
3. **CDN role redirects** — `/admin`, `/coach`, `/team-administrator` gated in `netlify.toml` with login fallbacks.
4. **Staff route headers** — Live `/staff/login` returned `cache-control: no-store` and `x-robots-tag: noindex, nofollow` during audit HEAD check.
5. **Public hardening headers** — Live `/` returned `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, referrer-policy, permissions-policy, HSTS.
6. **No hardcoded passwords** — Automated test scans auth-related sources for password literals / localStorage auth proof.
7. **Connections reject secrets** — Validation blocks password/API-secret shaped values; payments disabled in published JSON.
8. **GitHub token server-only** — Content publish reads `GITHUB_CONTENT_TOKEN` via Netlify env helper; not `VITE_*`.
9. **Identity signup hook** — Privileged roles assigned only when planned username + planned_role match roster (`identity-signup.ts`).
10. **Rate limiting helper** — Present for complementary throttling (in-memory; resets on cold start — limitation noted).

### Risks / limitations (document; Level 2–3)

| ID | Item | Level | Notes |
| --- | --- | --- | --- |
| S1 | Production auth not enabled | Blocker for staff use | Owner must configure Identity + env — intentional |
| S2 | In-memory rate limit not durable | Level 3 | Acceptable complement; Identity provides primary login throttling |
| S3 | No Content-Security-Policy yet | Level 3 | Adding CSP needs careful allowlist for fonts/QR/external links — document only this release |
| S4 | Contact form not wired | Level 2 / product | Avoids accidental PII collection; mailto remains |
| S5 | QR uses third-party image API when URL set | Level 3 | Only after approved https sponsorship URL; currently unused |
| S6 | Netlify Identity MFA not available | Level 3 | Documented in admin setup; future Auth0/MFA |
| S7 | Announcements send not implemented | Level 2 | UI correctly blocked |
| S8 | Owner must keep Identity invite-only | Operational | Misconfiguration risk if registration opened |

### Safe fixes applied in this audit package

- Public Privacy page + footer links (transparency)
- Documentation of gates, rollback, and admin enablement
- No auth flags flipped on
- No payment destinations activated

### Explicit non-actions (authorized hard NO)

- Did not enable production auth
- Did not activate payments / change destinations
- Did not force-push or merge `main`
- Did not claim LIVE deploy of audit branch
