# RELEASE CANDIDATE — WAHSB

Stabilization pass recorded **2026-10-29** (America/Los_Angeles). Classification unchanged until owner merges/deploys and completes gated items for the chosen launch scope.

## Classification

**READY WITH DOCUMENTED LIMITATIONS**

Not fully production-ready: privacy/docs live only after review-branch merge+deploy; staff auth, payments, and several integration URLs remain owner-gated.

## Exact RC commits

| Role | Ref | Full SHA |
| --- | --- | --- |
| Production baseline (`main` tip; live site expected to track this) | `51fb292` | `51fb29270bc3d16d4fb85f1983b6b0d110b6d35c` |
| Prior readiness tip (pre-RC doc refresh) | `15e7e98` | `15e7e98958e93e7133e45aa7b04284b4aaee7101` |
| RC handoff tip | `c6b9b14` on `cursor/release-candidate-handoff-bfc2` | `c6b9b14952c83bc20dfe9aeef2b649ee42f70a62` |

**Do not treat tip SHA as deployed.** Live: https://albany-hs-bowling.netlify.app/ tracks Netlify production from `main`, not the audit/RC branch. No immutable production tag created (unverified / not owner-approved).

## Changes completed (review lineage vs `main`)

Level 1 only — no redesign, no feature re-enablement:

- `/privacy` + footer / homepage Privacy links + search index entry
- Docs package: baseline, history, changelog, rollback, backup, deployment, admin, QA, design guidelines, handoff, readiness, **owner action register**, **this RC note**
- `AGENTS.md` guardrails
- Test asserting privacy route/footer ship on the review branch
- Diff vs `main`: 21 paths (docs + Privacy/footer wiring); no nav redesign; no routing/functionality beyond Privacy

## Build history pointer

See `BUILD-HISTORY.md`. Package version remains `0.1.0`. Meaningful git SHAs are the release identifiers until an owner-approved tagged release.

## Tests (this RC machine)

| Command | Outcome |
| --- | --- |
| `npm test` | **26 passed, 0 failed** (12 suites) |
| `npm run build` | **success** (`tsc --noEmit` + `vite build`); Vite chunk >500 kB warning (Level 3, not a failure) |
| Separate lint script | **none** in `package.json` (typecheck via build) |
| Browser / visual a11y lab | **Not claimed** — no in-agent browser walkthrough this pass |
| Live HEAD | `/` and `/staff/login` → 200 with security headers; `/privacy` → 200 is **SPA fallback only** (Privacy component **not** on `main`) |

## Limitations (summary)

See `OWNER-ACTION-REGISTER.md` and `RELEASE-READINESS.md`. Gates confirmed in published JSON / `netlify.toml`: admin UI off; payments disabled; season closed; BSN `teamStoreUrl` null with UX note; Sterling invite null with info-URL fallback; sponsor QR not-ready; contact form preview-only; announcements non-sending.

## Rollback

`ROLLBACK-PROCEDURE.md` — prefer Netlify publish rollback or `git revert`; never force-push `main`. Homepage component rollback: `HomeReview` → `Home`.

## Owner checklist

`OWNER-ACTION-REGISTER.md` items 1–8.

## Recommended next approved release action

1. Owner opens/approves PR: review/RC branch → `main` (privacy + docs). **Do not merge without owner approval.**
2. Confirm Netlify production deploy SHA matches merged tip; smoke `/`, `/privacy`, `/team-gear`, `/volunteer`, `/staff/login`.
3. Client accepts brochure scope under documented limitations **or** completes Level 2 owner config for expanded scope.
4. Only after owner approval: create an **immutable git tag** for that production commit (e.g. `v0.1.0-brochure`) — not before.
