# DEPLOYMENT GUIDE

## Environments

| Environment | Purpose | Notes |
| --- | --- | --- |
| Local Vite | UI development | `npm run dev` — Identity staff auth is not fully testable here |
| Netlify Deploy Preview | PR previews | Preferred for reviewing audit/feature branches |
| Netlify Production | `https://albany-hs-bowling.netlify.app/` | Tied to `main` in the usual Git↔Netlify setup |

## Standard build

Requires Node.js 22 (Netlify `NODE_VERSION=22`).

```bash
npm install
npm test
npm run build
npm run preview   # optional local static check of dist/
```

Netlify build settings (from `netlify.toml`):

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

## Normal publish workflow (owner / production)

Saved Project preference normally: test → commit → push `origin/main` → verify Netlify.

**Client-readiness audit override:** deliver on review branch `audit/wahsb-client-readiness` and open a PR to `main`. Do **not** merge or push audit changes directly to `main` from the audit agent. Owner merges after review.

## Feature flags (owner-controlled)

Never enable in git as production-on by default:

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_ADMIN_AUTH_ENABLED` | Netlify UI env only (do **not** set in `netlify.toml` — toml overrides UI) | Shows staff login UI when exactly `true`; unset stays off |
| `ADMIN_AUTH_ENABLED` | Netlify env only | Enables server staff session APIs |
| `ADMIN_EMAIL_ALLOWLIST` | Netlify env only | Super-admin email allowlist (fail closed if empty when auth on) |
| `GITHUB_CONTENT_TOKEN` | Netlify env only | Content draft/publish via GitHub API |
| `GITHUB_CONTENT_OWNER` / `REPO` / `BRANCH` | Netlify env | Defaults documented in `.env.example` |

Changing any `VITE_*` requires a new deploy to bake into the client bundle.

## Manual drag-and-drop deploy

1. `npm run build`
2. Upload contents of `dist/` in Netlify (includes copied `public/_headers`)
3. Prefer Git-based deploys for auditability

## Post-deploy checks (do not invent results)

- [ ] Homepage loads
- [ ] `/team-gear` BSN handoff intact
- [ ] `/volunteer` Sterling messaging intact
- [ ] Registration-closed notice still present where expected
- [ ] `/privacy` reachable after privacy ship
- [ ] `/staff/login` gated unless owner enabled auth
- [ ] Response headers still present (frame deny, nosniff, etc.)

## Claiming LIVE

Only claim production LIVE after evidence: Netlify production deploy succeeded for the intended commit SHA, or live HTTP checks against that deploy. Preview URLs are not production.
