# Private data plan

The public website can keep approved text in GitHub. The following records cannot:

- Real bowler profiles and statistics
- Parent and guardian contacts
- Consent and photo permissions
- Unpublished photographs
- Family invitation codes
- Donation and payer records
- Provider secret keys

## Recommended storage

Use a private Postgres database for records and a private object store for photographs. Netlify Database is the closest managed Postgres option for this Netlify site. Netlify Blobs can hold photograph files, but it is not the database for households or payments.

Secrets stay in Netlify function environment variables. They are read with `Netlify.env.get` inside functions. They are never given a `VITE_` name, because that would copy them into the public site.

## Access

| Person | May open | May not open |
| --- | --- | --- |
| Super Administrator | Roster, publishing, payment settings, and the records their role is allowed to administer | Another family's gallery by guessing an id |
| Club Administrator | Program copy, fundraiser drafts, and operational contact fields that the role allows | Live payment activation and another household |
| Coach | Bowler and practice fields needed for coaching | Payment settings and unrelated households |
| Verified guardian | Their own children and photos covered by a current invitation | Any other household |
| Public visitor | Approved public pages and, later, a moderated photo submission form | Staging files, staff pages, and private ids |

The server checks the role. Hiding a button is not the check.

## Migration

1. Create the empty database and confirm the function can connect. Do not copy placeholder bowlers in as real students.
2. Add roster tables with stable ids. Staff enter or import real bowlers only after this exists.
3. Add guardian and consent tables. Do not send invitations until isolation tests pass.
4. Add private media with a publish step that copies an approved image to a public address and deletes that address when consent is withdrawn.
5. Add donation tables only as a copy of provider-confirmed events. The payment provider remains the financial source.
6. Keep GitHub content for public wording. Do not add a private export to the repository.

## Retention

Keep a payment record only as long as the club's recordkeeping requires, and do not store a card number at all. Delete a photograph file when consent is withdrawn, not only a database flag. Record who changed a private row and when.

The table list is written in `db/proposed/001_private_foundation.sql`. That file is not applied. `@netlify/database` is not installed, so a deploy does not create a database. Statistics import stays off until the owner approves the database and a connection test passes.
