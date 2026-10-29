# RELEASE READINESS

Evidence recorded during the client-readiness audit on branch `audit/wahsb-client-readiness`, re-verified in the **2026-10-29 RC stabilization** pass on `cursor/release-candidate-handoff-bfc2`. Baseline commit before audit edits: `51fb29270bc3d16d4fb85f1983b6b0d110b6d35c`.

## Final classification

**READY WITH DOCUMENTED LIMITATIONS**

Rationale: The public brochure site is operational on the existing live URL with registration-closed messaging, BSN handoff, Sterling volunteer guidance, and security headers verified by HEAD requests. Staff auth, payments, sponsorship QR target, dedicated BSN storefront URL, Sterling invite URL, contact-form delivery, and email announcement sending remain intentionally incomplete or owner-gated. Those gaps are documented; they do not block public brochure acceptance if the client accepts the listed limitations.

Not “READY FOR CLIENT ACCEPTANCE” (unqualified) because owner-gated staff/payment/config items are unfinished. Not “NOT READY” because no blocking defect was found that breaks the public brochure purpose under the preserve constraints.

Not marked fully production-ready: `/privacy` + readiness docs are **review-branch only** until owner merges and Netlify deploys that tip; tip SHA must not be assumed equal to production.

## 11-point checklist

| # | Criterion | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Baseline & history documented | Pass | `RELEASE-BASELINE.md`, `BUILD-HISTORY.md`, `CHANGELOG.md`, `RELEASE-CANDIDATE.md` |
| 2 | Rollback & backup documented | Pass | `ROLLBACK-PROCEDURE.md`, `BACKUP-AND-RECOVERY.md` |
| 3 | Security Phases 1–3 audited; unsafe changes not enabled | Pass (limited) | `SECURITY-AUDIT-PHASES-1-3.md`; auth/payments remain off |
| 4 | Privacy page + footer | Pass (in review/RC branch) | `/privacy` route; footer + HomeReview footer links — **not on `main` / not assumed LIVE** |
| 5 | Public pages preserve required messaging/handoffs | Pass (code review) | Season closed, BSN, Sterling, Home rollback-only; RC diff vs main is docs+privacy only |
| 6 | Calendar / venues | Pass (automated) | 5 venues; ICS/Google helpers; tests green |
| 7 | Fundraising / payments safety | Pass (limited) | Fundraisers listed; payments disabled in published connections |
| 8 | Admin workflows documented; production auth off | Pass (limited) | `ADMIN-GUIDE.md`; `VITE_ADMIN_AUTH_ENABLED=false` |
| 9 | QR / social / email status documented | Pass (limited) | QR blocked without URL; social live flags off; announcements send unavailable |
| 10 | Handoff + QA + design guidelines present | Pass | `CLIENT-HANDOFF.md`, `QA-CHECKLIST.md`, `WAHSB-DESIGN-GUIDELINES.md`, `AGENTS.md`, `OWNER-ACTION-REGISTER.md` |
| 11 | Tests/build + safe Git delivery (review branch/PR, not silent main merge) | Partial | RC re-ran 26 tests + build; PR attempt via agent tooling — owner compare if collaborator gate blocks |

## Level classification of remaining work

### Level 1 — Safe to ship in this PR (done or mechanical)

- Privacy page + footer
- Documentation package
- Search index entry for Privacy
- Automated tests remaining green

### Level 2 — Needs owner config / content (do not invent)

Full register: `OWNER-ACTION-REGISTER.md`.

- Netlify Identity invite-only + first super_admin + env flags
- `GITHUB_CONTENT_TOKEN` for CMS publish
- BSN `teamStoreUrl`
- Sterling `sterlingVolunteerInvitationUrl`
- `publicSponsorshipUrl` for QR
- Contact form backend (Netlify Forms or equivalent) if desired
- Email announcement send backend
- Approve/merge readiness/RC PR → `main` (privacy + docs)
- Optional: set `sharing.publicWebsiteUrl` in connections to the live site URL for share helpers

### Level 3 — Document only / future architecture

- CSP header rollout
- MFA via Auth0 (Identity limitation)
- Durable distributed rate limiting
- Parent accounts / photo permission / private chat (Project store future docs)
- Replacing third-party QR image host with first-party generation

## Public page review notes (Stage 4)

Reviewed in source (not a substitute for owner visual sign-off):

| Route | Notes |
| --- | --- |
| `/` | `HomeReview`; registration closed; homepage footer now includes Privacy |
| `/our-club` | Coaches + closed season messaging |
| `/practices` | Lakeshore; closed season card |
| `/tournaments` | Venues + calendar when timed |
| `/team-gear` | BSN external; null team storefront noted in UI |
| `/sponsors` | PaymentOptions hidden when no live payments |
| `/sponsor-qr` | Explicit not-ready state |
| `/fundraisers` | From published content |
| `/volunteer` | Sterling info URL fallback |
| `/contact` | Preview form does not send |
| `/privacy` | Added this release package |
| `/sign-in` | Unavailable messaging |

## Mobile / desktop

Automated visual screenshot capture was not completed in this agent run as a verified artifact set. Owner should use `QA-CHECKLIST.md` mobile/desktop items on a Netlify Deploy Preview after PR open. Code includes skip-link, responsive CSS layers, and `prefers-reduced-motion` handling on hash scroll.

## Automated verification (RC pass on review lineage)

Recorded on this machine (Node v24.15.0; build targets Node 22 via `netlify.toml`):

- `npm test` → **26 passed, 0 failed** (12 suites)
- `npm run build` → **success** (`tsc --noEmit` + `vite build`; Vite noted JS chunk >500 kB — Level 3 optimization note, not a failure)
- No separate `lint` script in `package.json`
- Browser visual / full a11y lab: **not performed / not claimed** this pass

## Feature gates re-confirmed (code + published content)

| Gate | Evidence |
| --- | --- |
| Admin UI off | `netlify.toml` `VITE_ADMIN_AUTH_ENABLED = "false"`; `isAdminAuthUiEnabled()` requires `"true"` |
| Payments disabled | All `payments[]` in `siteConnections.json`: `status: disabled`, `liveEnabled: false`, destinations `null` |
| Season closed | `seasonRegistrationClosed` copy present; used on Home/Our Club/Practices/Tournaments/Volunteer/Contact |
| BSN handoff | `teamStoreUrl: null` with dedicated-storefront note on `/team-gear` |
| Sterling safe | Invite URL null → info URL fallback; no invented org invite |
| Sponsor QR | `publicSponsorshipUrl: null` → “Not ready yet” |
| Student registration | Remains closed; not re-opened |
| Email / social live | All disabled / `liveEnabled: false` |

## Git delivery status

- Prior review branch: `origin/audit/wahsb-client-readiness` @ `15e7e98958e93e7133e45aa7b04284b4aaee7101`
- RC branch: `cursor/release-candidate-handoff-bfc2` (docs/register/RC updates atop review tip `15e7e98`; package commit `c6b9b14`)
- Compare (owner): https://github.com/stellaroskens/WAHSB/compare/main...cursor/release-candidate-handoff-bfc2?expand=1
- Also: https://github.com/stellaroskens/WAHSB/compare/main...audit/wahsb-client-readiness?expand=1
- No main merge; no force-push; no production tag.

## Netlify

- Existing production site responds at https://albany-hs-bowling.netlify.app/ (HEAD 200; security headers verified on RC pass).
- This workflow **does not** claim that audit/RC-branch changes are LIVE on production.
- `/privacy` HEAD 200 on production is SPA `index.html` fallback — Privacy route content ships only after review/RC merge + deploy.
- Prefer Deploy Preview after the owner opens/merges the PR for acceptance of privacy/docs changes.
