# Albany High School Bowling (AHSB)

Public website for Albany High School Bowling. The public abbreviation is **AHSB**. The GitHub repository and Netlify site name stay WAHSB.

Production: https://albany-hs-bowling.netlify.app/

This repository is the React, TypeScript, and Vite source. It does not store guardian consent, student photographs, household records, payment secrets, or bank details.

Administrator setup, the draft workflow, and the items that are still off are in [docs/ADMINISTRATOR_SETUP.md](docs/ADMINISTRATOR_SETUP.md).

## Public routes

| Route | Page |
| --- | --- |
| `/` | Home |
| `/our-club` | Our Club |
| `/practices` | Practices |
| `/tournaments` | Tournaments |
| `/meet-the-bowlers` | Meet the Bowlers |
| `/meet-the-bowlers/:playerId` | One bowler profile |
| `/team-gear` | Team Gear |
| `/sponsors` | Sponsors |
| `/sponsor-qr` | Sponsorship QR |
| `/fundraisers` | Fundraisers |
| `/bowl-a-thon` | Bowl-a-thon |
| `/resources` | Bowling Resources |
| `/volunteer` | Volunteer Opportunities |
| `/faq` | FAQ |
| `/contact` | Contact |
| `/sign-in` | Sign in |
| `/family` | Family page. Access is closed. |

The live homepage is `src/pages/HomeReview.tsx`. `src/pages/Home.tsx` is a rollback copy and is not routed.

## Staff routes

| Route | Who can open it |
| --- | --- |
| `/staff/login` | Staff sign-in |
| `/admin` | Super administrator |
| `/coach` and `/coach/bowlers` | Coach and super administrator |
| `/team-administrator` and `/team-administrator/bowlers` | Club Administrator (`team_administrator`) and super administrator |

Anonymous visitors to `/admin`, `/coach`, and `/team-administrator` are sent to `/staff/login`. A typed username is not authorization. Roles come from Netlify Identity.

Approved staff usernames, with no email addresses stored here:

- `cmeredith` and `cbreshears`, coaches
- `mfisher`, Club Administrator

## What is intentionally off

- Family accounts. `FAMILY_ACCESS_OPEN` is false. `/family` is a public closed notice, not a private dashboard.
- Student photo upload. Private image storage is not configured.
- Guardian consent saving. Consent is not written to GitHub.
- Real student profiles. Only the eight placeholder cards, Bowler 1 through Bowler 8, are public.
- Email sending. Announcements can be drafted. They are not sent.
- Payment activation. Stripe, PayPal, Venmo, and Cash App stay disabled until a destination is verified.

## Build

Requires Node.js 22.

```bash
npm install
npm test
npm run build
npm run preview
```

`npm run build` typechecks the site and writes `dist/`. That folder is not stored in Git. Netlify builds with `npm run build` and publishes `dist`.

Do not add real student names, photos, scores, birth dates, or account credentials to this repository.
