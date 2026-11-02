# Private database foundation

The schema and migration files are ready. They are not connected to a database yet.

`@netlify/database` is not installed. Installing it makes Netlify create a database on the next deploy. Do not install it, and do not push a commit that adds it, until the steps below are finished on your own Netlify account.

The migration does not insert players, guardians, scores, or emails. Missing scores stay empty. There is no birth-date column.

A guardian row is attached with `identity_user_id`, the id of an existing Netlify Identity user. The same Super Administrator account can be linked as a guardian. A second Identity account is not created, and an email address is not the key. `identity_user_id` is unique, so the same account cannot be attached twice.

## What you do in Netlify before the family pages are built

1. Open the Albany High School Bowling site in Netlify. Confirm the production branch is still `main`. Do not change it.
2. In Terminal, from this repository, install or update the Netlify CLI if `netlify database` is not a command: `npm install -g netlify-cli@latest`. You need CLI 26 or newer.
3. Run `netlify login` and finish the browser sign-in with the account that owns the site.
4. Run `netlify link` and choose the existing Albany High School Bowling site. Do not create a second site.
5. Run `netlify database status`. It should report that the database package is not installed yet. Do not paste the connection string into chat, GitHub, or a `VITE_` variable.
6. Reply here that those four checks are done. The next code change can then install `@netlify/database`, apply `netlify/database/migrations` to the local database only, and build the family screens.

Do not run `drizzle-kit push`. Do not run SQL against the hosted database. Do not merge this branch to `main`.

## What stays off until a local connection test passes

- Family invitations
- Real player records and public player profiles
- Excel or CSV import of real statistics
- Photo upload and publication
- Live payments
