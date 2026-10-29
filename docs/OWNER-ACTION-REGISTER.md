# OWNER ACTION REGISTER

Owner-gated items that remain incomplete. Agents must not invent URLs, secrets, or enable these without authorization. Never paste secret values into git or chat logs.

| # | Item | Status | Why needed | Where to configure | Blocks | How to verify (no secrets) |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Netlify Identity invite-only + first `super_admin` (`stellaroskens@gmail.com`) + env flags | **Missing** | Staff login / admin dashboards stay gated until Identity is invite-only and flags flip | Netlify Identity settings; Site env: `ADMIN_AUTH_ENABLED`, `VITE_ADMIN_AUTH_ENABLED`, `ADMIN_EMAIL_ALLOWLIST` (see `ADMIN-GUIDE.md` / Project store `ADMIN_PHASE1_SETUP.md`) | **Launch of staff tools** (not public brochure) | `/staff/login` shows real login (not “unavailable”); allowlisted invite can reach `/admin`; uninvited users cannot self-register |
| 2 | `GITHUB_CONTENT_TOKEN` | **Missing** | Content editor publish to GitHub needs a scoped token in Netlify Functions env | Netlify Site env (Functions only — never `VITE_*`) — `ADMIN_CONTENT_EDITOR.md` | **Feature-only** (CMS publish) | Draft → publish succeeds against the configured repo; failed auth returns safe error (no token echo) |
| 3 | BSN dedicated `teamStoreUrl` | **Missing** (`null`) | Generic BSN homepage is used until club storefront exists | `src/content/published/siteContent.json` → `teamGearShop.teamStoreUrl` (via content editor when enabled, or PR) | **Feature-only** (storefront deep-link) | `/team-gear` primary CTA opens the dedicated storefront; null note disappears |
| 4 | Sterling org invitation URL | **Missing** (`null`) | Volunteers fall back to Sterling info page, not club-specific invite | `siteContent.json` → `sterlingVolunteerInvitationUrl` | **Feature-only** (direct screening invite) | `/volunteer` CTA label becomes “Start volunteer background check” and opens invite URL |
| 5 | Public sponsorship URL | **Missing** (`null`) | Sponsorship QR page stays “Not ready yet” | Connections → `sharing.publicSponsorshipUrl` (approved HTTPS only) | **Feature-only** (QR print page) | `/sponsor-qr` shows QR + approved link; no destination invented |
| 6 | Email announcement send backend | **Missing** (email `disabled` / `liveEnabled: false`) | Announcements UI is prep-only; cannot send | Provider + Connections email verified/live; send Function | **Feature-only** (bulk email) | Admin announcements reports ready only when email verified+live; no silent send |
| 7 | Readiness PR approval (`audit` / RC branch → `main`) | **Pending owner** | Privacy page + docs package are on review branch only; production tracks `main` @ `51fb292` | GitHub compare/PR; Netlify deploy after merge | **Launch of `/privacy` + footer Privacy links on production** | After merge+deploy: Privacy route renders content (not SPA empty shell alone); footer link works |
| 8 | Payment destinations | **Disabled by design** | All payments `status: disabled`, `liveEnabled: false`, destinations `null` | Connections (super_admin only) after verified destinations exist | **Feature-only** (donations/checkout). Must stay off until owner authorizes | Public `/sponsors` and Bowl-a-Thon show no live payment UI in production |

## Optional / product decision

| Item | Status | Notes |
| --- | --- | --- |
| Contact form delivery | Preview-only | Wire Netlify Forms (or equivalent) if the client wants inbound messages from `/contact` |
| `sharing.publicWebsiteUrl` | `null` | Optional share helper; live site is already https://albany-hs-bowling.netlify.app/ |

## Explicit non-actions

- Do **not** re-enable student registration, admin, or payments without authorization
- Do **not** invent BSN / Sterling / sponsorship / payment URLs
- Do **not** commit tokens or Identity secrets
- Do **not** mark fully production-ready until owner checklist items required for the chosen launch scope are done
