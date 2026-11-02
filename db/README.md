# Private database foundation

The four migrations are applied to the local development database. `@netlify/database` is installed on this review branch so a deploy preview can provision the hosted database. Production stays on `main`. Do not merge this branch to `main` until you want the production site to use that database.

The migration does not insert players, guardians, scores, or emails. Missing scores stay empty. There is no birth-date column.

A guardian row is attached with `identity_user_id`, the id of an existing Netlify Identity user. The same Super Administrator account can be linked as a guardian. A second Identity account is not created, and an email address is not the key. `identity_user_id` is unique, so the same account cannot be attached twice.

## Preview-only activation

This review branch is the approved preview test. It does not publish production.

1. Confirm the production branch is still `main`.
2. This branch depends on `@netlify/database`. Do not commit a connection string.
3. Push only to this review branch. The preview deploy creates the hosted database and applies these migrations to the preview database branch.
4. Run `netlify database status --branch <preview-branch>` and confirm the four migrations are applied. Do not paste the connection string into chat, GitHub, or a `VITE_` variable.
5. Merge to `main` only when you want the production site to use that database.

Do not run `drizzle-kit push`. Do not change the hosted schema by hand.

## What stays off

- Family invitations
- Real player records and public player profiles
- Excel or CSV import of real statistics
- Photo upload and publication
- Live payments
