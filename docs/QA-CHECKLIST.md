# QA CHECKLIST

Use before owner acceptance. Mark items only with evidence from a real run.

## Build & automated

- [ ] `npm test` passes (record count)
- [ ] `npm run build` passes
- [ ] No secrets in diff (`.env`, tokens, private student data)

## Public pages

- [ ] `/` HomeReview loads; brand visible; registration-closed messaging present
- [ ] `/our-club` coaches/content load
- [ ] `/practices` Lakeshore info + registration closed
- [ ] `/tournaments` venues/dates; calendar controls only when times exist
- [ ] `/team-gear` BSN link; note if team storefront URL still missing
- [ ] `/sponsors` no live unverified payments
- [ ] `/sponsor-qr` shows “Not ready” unless sponsorship URL configured
- [ ] `/fundraisers` events match published content
- [ ] `/bowl-a-thon` pledge UI does not claim to send/save
- [ ] `/resources` empty/approved-only behavior intact
- [ ] `/volunteer` Sterling messaging; invitation URL note if missing
- [ ] `/contact` form does not send; mailto works
- [ ] `/faq` loads
- [ ] `/privacy` loads; linked from footer + homepage footer
- [ ] `/sign-in` explains accounts unavailable

## Staff (gated)

- [ ] `/staff/login` shows not-open when flags false
- [ ] `/admin` redirects/blocked for anonymous users
- [ ] Staff routes send `cache-control: no-store` and `x-robots-tag: noindex` on live/preview

## Mobile / desktop

- [ ] Primary nav usable on narrow viewport
- [ ] Homepage footer/nav wrap without clipping critical CTAs
- [ ] Skip link reaches `#main`
- [ ] Images have width/height or reserved space where expected

## Security / privacy smoke

- [ ] Response headers: frame deny, nosniff, referrer-policy, permissions-policy
- [ ] Payments remain disabled unless owner verified
- [ ] Privacy page wording matches actual behavior (form, auth, payments)

## Release packaging

- [ ] `docs/RELEASE-READINESS.md` 11-point checklist completed with evidence
- [ ] Classification set: READY FOR CLIENT ACCEPTANCE | READY WITH DOCUMENTED LIMITATIONS | NOT READY
