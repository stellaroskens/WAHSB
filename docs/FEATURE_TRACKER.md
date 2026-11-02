# Unfinished feature tracker

This tracker lists work that was requested and is not complete. A menu item is not the same as a working feature.

## A. Roster management

- Current: eight public placeholder profiles. Staff can edit those placeholders. Stable public ids exist for the placeholders only.
- Missing: a private roster, legal names, grades, guardian approval, and a publication workflow for real students.
- Infrastructure: a private database. GitHub JSON is not an acceptable store.
- Security: no real student record in the repository, the public bundle, or a preview deploy.
- Depends on: the private database and an access policy.
- Tests still needed: create, edit, archive, and refuse publication without guardian approval.
- Owner decision: approve a database provider and confirm who may see private fields.

## B. Spreadsheet imports

- Current: none.
- Missing: Excel, CSV, and Google Sheets upload, column mapping, player matching, preview, validation, history, and rollback.
- Infrastructure: private roster first, then a staff-only upload function. Google access must be read-only and must not live in the browser.
- Security: reject formulas, limit file size, and never create a student from an unknown name.
- Depends on: roster A.
- Tests still needed: exact matches, duplicate names, zeros versus blanks, repeated imports, and unauthorized access.
- Owner decision: provide a sample spreadsheet shape after the private roster exists. Do not upload real student scores before then.

## C. Parents and guardians

- Current: the family page says access is closed. There is no household database.
- Missing: guardian records, relationships, consent, invitations, and emergency contacts.
- Infrastructure: private database and invitation email that does not reveal whether an address has an account.
- Security: one household cannot open another by changing a URL.
- Depends on: roster A.
- Tests still needed: cross-household denial, consent withdrawal, and expired invitations.
- Owner decision: approve the invitation process before any family email is sent.

## D. Photo albums

- Current: no public gallery and no upload form.
- Missing: public albums, a QR submission page, private staging, moderation, removal, player tags, and family-only galleries.
- Infrastructure: private file storage that can revoke a public URL, plus image re-encoding that strips location data.
- Security: `AHSB2026` may later be an event label. It must never be the password for student photos.
- Depends on: roster A and guardian consent C.
- Tests still needed: unsafe files rejected, unapproved images stay private, and withdrawn consent stops the image from loading.
- Owner decision: approve storage and the consent rule before any student photo is uploaded.

## E. Coach recommendations

- Current: Bowling Resources has an empty Coach recommended gear section. It does not list products.
- Missing: a staff editor for a title, link, reason, skill level, and review date, plus a publish step.
- Infrastructure: the existing content draft is enough for public text. Product images need permission and storage.
- Security: no copied retailer photos or invented endorsements.
- Depends on: content publishing, which still needs `GITHUB_CONTENT_TOKEN`.
- Tests still needed: an unpublished recommendation stays off the public page.
- Owner decision: coaches write the real recommendations. Do not invent them.

## F. Live donations

- Current: `/donate` and `/admin/donations` explain that checkout is off. The server rejects amounts outside $1 to $1,000 and rejects a bad Stripe signature. A valid signature is still not saved.
- Missing: a verified Stripe or PayPal account, hosted checkout, a private transaction database, receipts, and Apple Pay or Google Pay inside that checkout.
- Infrastructure: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DONATION_DATABASE_URL`, and `PAYMENTS_LIVE=true`, all in Netlify function settings. None of these are set.
- Security: no card numbers in AHSB forms. A return from a payment site is not proof of payment.
- Depends on: owner approval after the launch checklist in the donations screen.
- Tests still needed: a provider sandbox charge, a canceled checkout, a duplicate webhook, and a refund. Those cannot run without provider credentials.
- Owner decision: choose the legal account owner and confirm Oregon charitable-solicitation rules before any tax wording.

Recommended order: private database, then roster and spreadsheet import, then guardians, then photos, then coach-written recommendations, then live payments.
