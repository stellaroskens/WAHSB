# RELEASE BASELINE

Recorded for the WAHSB client-readiness audit. Facts below were verified from the local repository and live HTTP headers at the time of recording. Do not treat this file as a claim that every feature is production-enabled.

## Identity

| Field | Value |
| --- | --- |
| Repository | https://github.com/stellaroskens/WAHSB.git |
| Live public URL | https://albany-hs-bowling.netlify.app/ |
| Baseline commit (audit start) | `51fb29270bc3d16d4fb85f1983b6b0d110b6d35c` |
| Baseline commit message | feat: prepare sponsorship QR page and announcements dashboard |
| Baseline commit date (author) | 2026-10-29 09:58:09 -0700 |
| Branch at audit start | `cursor/admin-qr-announcements-14ee` (matched `origin/main` at same SHA) |
| Review branch for this work | `audit/wahsb-client-readiness` |
| Package version | `0.1.0` (`package.json`) |
| Stack | React 19, TypeScript, Vite 8, Netlify Functions + Identity client |

## What this baseline includes (in git)

- Public brochure pages (Home via `HomeReview`, Our Club, Practices, Tournaments, Team Gear BSN handoff, Sponsors, Fundraisers, Bowl-a-Thon, Resources, Volunteer/Sterling, Contact, FAQ, Sign-in unavailable, Sponsor QR prep)
- Season registration closed messaging for 2026–2027
- Admin foundations Phases 1–3 in code (gated off by default)
- Connections dashboard (payments/social/email destinations all disabled in published JSON)
- Five venues + calendar/ICS helpers and tests
- Security response headers in `public/_headers`

## Explicitly not claimed at baseline

- Production staff auth is **not** enabled (`VITE_ADMIN_AUTH_ENABLED=false` in `netlify.toml`)
- Netlify Identity invite-only status was **not** independently confirmed in the Netlify UI during this audit
- Live payment destinations are **not** active (`src/content/published/siteConnections.json` all `disabled` / `liveEnabled: false`)
- Dedicated BSN team storefront URL is **not** set (`teamStoreUrl` null)
- Sterling org invitation URL is **not** set (info URL fallback only)
- Public sponsorship URL for QR is **not** set
- Contact form does **not** send messages
- This audit does **not** push or merge `main`; delivery is review-branch + PR only

## Verified live headers (baseline check)

Request: `HEAD https://albany-hs-bowling.netlify.app/` → HTTP/2 200 with `x-frame-options: DENY`, `x-content-type-options: nosniff`, `referrer-policy: strict-origin-when-cross-origin`, `permissions-policy: camera=(), microphone=(), geolocation=(), payment=()`, HSTS present.

Request: `HEAD https://albany-hs-bowling.netlify.app/staff/login` → HTTP/2 200 with `cache-control: no-store`, `x-robots-tag: noindex, nofollow`, same framing/nosniff policies.

## Local verification at audit start

- `npm test` → 25 passed, 0 failed (commit `51fb292` tree before audit edits)
- Node locally: v24.15.0 (build targets Node 22 via `netlify.toml`)

## RC re-verification (2026-10-29)

| Field | Value |
| --- | --- |
| `origin/main` (unchanged) | `51fb29270bc3d16d4fb85f1983b6b0d110b6d35c` |
| Prior review tip | `15e7e98958e93e7133e45aa7b04284b4aaee7101` |
| RC branch | `cursor/release-candidate-handoff-bfc2` (branched from review tip) |
| `npm test` on RC tree | 26 passed, 0 failed |
| `npm run build` | success (`tsc --noEmit` + vite) |
| Production tags | none (do not tag until owner-approved release) |
| Deploy claim | **none** — tip ≠ assumed live; production tracks `main` |

## Preserve constraints

- Athletic navy / blue / red design tokens (`--sw-navy`, `--sw-royal`, `--sw-red`)
- BSN Team Gear handoff (no in-site customizer/cart)
- Season registration closed messaging
- Sterling volunteer page
- `Home.tsx` remains rollback-only; live home is `HomeReview`
