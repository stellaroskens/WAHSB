# CHANGELOG

All notable changes for WAHSB client-facing releases. Keep entries factual.

## [Unreleased] — release candidate (review branch lineage)

### Added

- Public `/privacy` page and Privacy links in site footer + homepage footer
- Repository `docs/` client-readiness package (baseline, history, rollback, backup, deployment, admin, handoff, QA, release readiness, design guidelines)
- `docs/OWNER-ACTION-REGISTER.md` and `docs/RELEASE-CANDIDATE.md` (RC stabilization pass)
- `AGENTS.md` contributor/agent guardrails for this repo

### Documented

- Security audit notes for Phases 1–3 (gated auth, allowlist, secret rejection for connections)
- Level 1–3 change classification and owner blockers (Identity enablement, tokens, BSN store URL, Sterling invite URL, sponsorship URL, payments, readiness PR)
- Verified baseline: `main` @ `51fb292`; review tip lineage from `15e7e98`
- Future parent accounts / photo permission / private chat remain out of scope (see Project store future docs)

### Verified (RC pass)

- `npm test` → 26 passed; `npm run build` → success
- Feature gates re-confirmed (admin off, payments disabled, season closed, missing URLs have safe UX)

### Safety

- No production auth enablement
- No payment destination activation
- No force-push / main merge from this workflow; no production tag for unverified builds
- Design tokens and BSN / Sterling / registration-closed / Home rollback constraints preserved

## Prior packaged history (git)

See `BUILD-HISTORY.md` for commit-level history through `51fb292`.
