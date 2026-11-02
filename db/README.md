# Private database foundation

The four migrations are applied to the local development database. The hosted Netlify Database is not enabled.

`@netlify/database` is not installed. Installing it makes Netlify create a database on the next deploy. Do not install it, and do not push a commit that adds it, until the steps below are finished on your own Netlify account.

The migration does not insert players, guardians, scores, or emails. Missing scores stay empty. There is no birth-date column.

A guardian row is attached with `identity_user_id`, the id of an existing Netlify Identity user. The same Super Administrator account can be linked as a guardian. A second Identity account is not created, and an email address is not the key. `identity_user_id` is unique, so the same account cannot be attached twice.

## Activate the hosted database only after you approve it

Do not run these steps for this review. They turn on the hosted database at the next deploy.

1. Confirm the production branch is still `main`.
2. In a separate commit, from this repository, run `npm install @netlify/database`. Do not commit a connection string.
3. Push that commit to a pull request. The preview deploy creates the hosted database and applies these migrations to the preview branch. Production stays on `main` until that pull request is merged.
4. Run `netlify database status --branch <preview-branch>` and confirm the four migrations are applied. Do not paste the connection string into chat, GitHub, or a `VITE_` variable.
5. Merge to `main` only when you want the production site to use that database.

Do not run `drizzle-kit push`. Do not run SQL against the hosted database by hand.

## What stays off until you approve the hosted database

- Family invitations
- Real player records and public player profiles
- Excel or CSV import of real statistics
- Photo upload and publication
- Live payments
