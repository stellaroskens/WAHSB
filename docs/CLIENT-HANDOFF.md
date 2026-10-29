# CLIENT HANDOFF — Albany High School Bowling Website

## What you are receiving

A public club website for Albany High School Bowling, hosted at:

**https://albany-hs-bowling.netlify.app/**

Source repository: **https://github.com/stellaroskens/WAHSB**

This site informs families about the club, practices, tournaments, volunteering, fundraising, and team gear. It is **not** a student information system, payment processor, or parent portal.

## What works on the public site today

- Athletic branded pages (navy / blue / red)
- Homepage stage with Meet the Team / practices & tournaments entry points
- **2026–2027 season registration closed** messaging across key pages
- Team Gear handoff to **BSN SPORTS** (external). Dedicated team storefront URL can be added later
- Volunteer page with **Sterling Volunteers** background-check guidance
- Practice tournament venues/dates with calendar helpers when times exist
- Fundraiser listings from published content
- Contact email and layout preview form (**form does not send**)
- Privacy notice at `/privacy`
- Security-oriented HTTP headers (clickjacking protection, nosniff, etc.)

## Staff tools (built, not production-enabled)

Code includes invitation-only staff administration (Phases 1–3): login foundations, role dashboards, content drafts/publish, connections manager, announcements UI shell.

**These stay off** until the owner enables Netlify Identity (invite-only) and environment flags. See `ADMIN-GUIDE.md` and Project store `ADMIN_PHASE1_SETUP.md`.

## Owner actions still required (blockers / limitations)

| Item | Why it matters |
| --- | --- |
| Enable Netlify Identity invite-only + first `super_admin` | Staff login will not work until done |
| Set `GITHUB_CONTENT_TOKEN` (optional until editing) | Content publish from Admin |
| Provide BSN dedicated team storefront URL | Replaces generic BSN home link |
| Provide Sterling organization invitation URL | Directs volunteers into the club’s screening invite |
| Provide public sponsorship URL | Enables sponsorship QR page |
| Verify payment destinations before enabling | Donations/checkout stay disabled by design |
| Wire email announcement send backend | Announcements UI does not send mail yet |
| Connect contact form (optional) | Currently preview-only |

## What is intentionally out of scope now

- Parent/guardian accounts (see future requirements doc in Project store)
- Photo permission workflows
- Private parent/staff chat
- In-site team gear customizer / cart (replaced by BSN)
- Invented payment or social destinations

## How updates should be published

1. Change code/content on a branch
2. `npm test` && `npm run build`
3. Open PR → review → merge to `main` (owner)
4. Confirm Netlify production deploy for that commit before calling it LIVE

Rollback: see `ROLLBACK-PROCEDURE.md`. Backups: see `BACKUP-AND-RECOVERY.md`.

## Design constraints for future editors

Preserve athletic navy/blue/red, BSN handoff, registration-closed messaging, Sterling volunteer page, and Home rollback component. Details: `WAHSB-DESIGN-GUIDELINES.md`.

## Acceptance classification pointer

See `RELEASE-READINESS.md` and `RELEASE-CANDIDATE.md`. Classification: **READY WITH DOCUMENTED LIMITATIONS**. Owner checklist: `OWNER-ACTION-REGISTER.md`.
