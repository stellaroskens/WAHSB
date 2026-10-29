# BUILD HISTORY

Chronological record of meaningful WAHSB website builds in this repository. Derived from `git log` on the audited tree. Messages are abbreviated from commit subjects.

| Date (author) | Commit | Summary |
| --- | --- | --- |
| (initial) | `3a5da38` | Initial commit |
| (early site) | `b47acd9` | Add editable public Albany High School Bowling website |
| | `7987e1e` | Replace team gear customizer with BSN Sports landing page |
| | `9905e84` | Replace team gear customizer with BSN Sports (follow-up) |
| | `55637a5` | Replace club recruitment with Sterling Volunteers information |
| | `7c04f7c` | Close 2026–27 student registration across WAHSB |
| | `4ac7fa0` | Phase 1 invitation-only admin foundations |
| | `264b783` | Phase 2 invite-only staff accounts and role dashboards |
| | `bcd4237` | Phase 3 authenticated content editor with draft publishing |
| | `6f3f33e` | Admin connections for payments, social, and email |
| | `7e8e4da` | Verify five venues and calendar ICS generation (tests) |
| 2026-10-29 | `51fb292` | Sponsorship QR page prep and announcements dashboard — **verified `main` / production baseline** |
| 2026-10-29 | `3bf3bea` | Client-readiness docs, privacy page/footer, release package (review branch) |
| 2026-10-29 | `15e7e98` | Note PR collaborator blocker on readiness checklist (review branch) |
| 2026-10-29 | *(RC handoff)* | Release-candidate stabilization: OWNER-ACTION-REGISTER, RELEASE-CANDIDATE, re-verified tests/gates |

## Verified baseline (RC pass 2026-10-29)

| Field | Value |
| --- | --- |
| `origin/main` | `51fb29270bc3d16d4fb85f1983b6b0d110b6d35c` |
| Review lineage parent | `15e7e98958e93e7133e45aa7b04284b4aaee7101` |
| Live site | https://albany-hs-bowling.netlify.app/ (tracks Netlify production from `main`; **not** assumed equal to review tip) |
| Immutable production tags | **none** — do not tag until owner-approved release |

## Notes

- Phases 1–3 are present in git and were **not** rebuilt during the client-readiness audit; they were audited and documented.
- Auth UI remains feature-gated off until the owner enables Identity + env flags.
- Prefer this file for narrative history; use `CHANGELOG.md` for release-oriented deltas.
- Package version remains `0.1.0`; meaningful versions for ops are git SHAs until a tagged release.
