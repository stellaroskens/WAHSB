# AGENTS.md — WAHSB contributor / agent guardrails

## Product

Public Albany High School Bowling website (React + Vite + Netlify). Live: https://albany-hs-bowling.netlify.app/

## Hard rules

- Do **not** invent facts, approvals, test outcomes, or LIVE deploy confirmations.
- Do **not** force-push, rewrite shared history, delete/recreate the repo, or run destructive Git ops.
- Do **not** merge to `main` unless the human owner explicitly requests it for that change.
- Do **not** enable production staff auth, activate payment destinations, or change financial endpoints without explicit owner authorization.
- Do **not** commit secrets, `.env` values, student private records, or API tokens.
- Prefer review branches + PRs for non-trivial work.

## Preserve

- Athletic navy / blue / red design (`src/styles/sitewide.css` tokens)
- BSN Team Gear external handoff (no in-site cart/customizer)
- Season registration closed messaging for 2026–2027
- Sterling Volunteers volunteer page behavior
- `Home.tsx` rollback-only; live home is `HomeReview`

## Auth & payments

- Staff auth gated by `VITE_ADMIN_AUTH_ENABLED` / `ADMIN_AUTH_ENABLED` (default off)
- Connections validation must continue rejecting secrets
- Payments remain disabled until verified

## Docs

Release and handoff docs live in `docs/`. Read `docs/RELEASE-BASELINE.md` and `docs/RELEASE-READINESS.md` before claiming client readiness.

## Verify before publish

```bash
npm test
npm run build
```

Report commit SHA, branch, PR URL, test results, and Netlify status with evidence only.
