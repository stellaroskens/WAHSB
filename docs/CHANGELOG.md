# CHANGELOG

All notable changes for WAHSB client-facing releases. Keep entries factual.

## [Unreleased] — audit/wahsb-client-readiness

### Added

- Public `/privacy` page and Privacy links in site footer + homepage footer
- Repository `docs/` client-readiness package (baseline, history, rollback, backup, deployment, admin, handoff, QA, release readiness, design guidelines)
- `AGENTS.md` contributor/agent guardrails for this repo

### Documented

- Security audit notes for Phases 1–3 (gated auth, allowlist, secret rejection for connections)
- Level 1–3 change classification and owner blockers (Identity enablement, tokens, BSN store URL, Sterling invite URL, sponsorship URL, payments)
- Future parent accounts / photo permission / private chat remain out of scope (see Project store future docs)

### Safety

- No production auth enablement
- No payment destination activation
- No force-push / main merge from this audit workflow
- Design tokens and BSN / Sterling / registration-closed / Home rollback constraints preserved

## Prior packaged history (git)

See `BUILD-HISTORY.md` for commit-level history through `51fb292`.
