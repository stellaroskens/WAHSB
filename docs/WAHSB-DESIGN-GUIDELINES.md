# WAHSB DESIGN GUIDELINES

## Brand direction

Athletic high-school club identity: **navy / royal blue / red** on clean paper surfaces. Avoid generic purple/indigo AI themes, cream-serif terracotta clusters, or dense broadsheet newspaper layouts.

Primary tokens (sitewide layer):

| Token | Value | Role |
| --- | --- | --- |
| `--sw-navy` | `#0a1c48` | Primary athletic field |
| `--sw-ink` | `#12254a` | Body text |
| `--sw-royal` | `#143c94` | Accents / links energy |
| `--sw-red` | `#d21b2b` | Emphasis / CTAs |
| `--sw-paper` | `#ffffff` | Content surface |
| `--sw-backdrop` | `#f4f6fa` | Page atmosphere |

Fonts (loaded in `index.html`): Oswald (display) + Source Sans 3 (body).

## Layout rules for this product

- Homepage (`HomeReview`) is a dedicated stage composition with its own header/footer; other pages use shared `Header` / `Footer`.
- Content pages use `AthleticHero` scenes; keep brand name visible as a strong signal in hero subtitle/title patterns already established.
- Prefer full-bleed athletic hero treatments already in `sitewide.css` over inset collage cards in heroes.
- Preserve existing card usage where it supports interaction or dense info (venues, fundraisers); do not invent new card-heavy dashboards on public marketing pages.

## Must preserve

- BSN Team Gear handoff page (external shop; no cart)
- Season registration closed messaging tone and visibility
- Sterling Volunteers volunteer guidance
- `Home.tsx` rollback mockup remains available and unused until explicitly swapped

## Imagery

Use club-approved local assets under `public/brand`, `public/images`, `public/coaches`, `public/flyers`. Do not hotlink unapproved remote sponsor logos into content JSON.

## Motion

Existing motion should remain purposeful (hero sheens, reduced-motion respectful scroll). Respect `prefers-reduced-motion` where already implemented.
