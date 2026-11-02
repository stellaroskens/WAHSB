# Private database foundation

This folder is a proposal. It is not connected to a database, and it does not create one.

Do not add `@netlify/database` until the site owner approves provisioning. Installing that package makes Netlify create a database on the next deploy.

## What the owner runs, after approving a database

1. In the repository directory, install the current Netlify CLI if `netlify database` is not recognized: `npm install -g netlify-cli@latest`.
2. Run `netlify database init` and choose Drizzle. That installs `@netlify/database` and `drizzle-orm@beta`.
3. Put the tables in `db/proposed/001_private_foundation.sql` into `db/schema.ts` and generate a migration with `npx drizzle-kit generate`.
4. Apply that migration only to the local database with `netlify database migrations apply`.
5. Commit the schema and the generated files under `netlify/database/migrations`. Push the branch. Netlify applies the migration on the preview deploy, then on production when that deploy is published.
6. Do not paste `NETLIFY_DB_URL` into chat, GitHub, or a `VITE_` variable.

Do not run `drizzle-kit push`, and do not apply SQL directly to the hosted database.

## What stays off until that database answers a connection test

- Real player records
- Excel and CSV statistics import
- Guardian records and family invitations
- Photo upload and publication
- Donation records

The public site keeps using the GitHub content file for approved wording. This database is not that file.
