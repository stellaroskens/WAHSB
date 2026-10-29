# Albany High School Bowling

Public website source for the Albany High School Bowling club site. This repository is the editable React, TypeScript, and Vite project for the public pages.

It does not include private student records, coach or player administration, guardian accounts, photo galleries, payment processing, or the club's other project archives.

## Pages

Home, Our Club, Practices, Tournaments, Team Gear, Sponsors, Fundraisers, Bowling Resources, Contact, FAQ, and Bowl-a-Thon.

Sign In explains that team accounts are not open.

Staff administration foundations live under `/staff/login` and `/admin`. They use Netlify Identity (invitation-only) and stay disabled until configured — see `ADMIN_PHASE1_SETUP.md` in the project docs store.

## Team Gear

Team gear is sold through [BSN SPORTS](https://www.bsnsports.com/), an external provider. This site no longer hosts a gear customizer, and it has no shopping cart, wishlist, pricing, or checkout.

The `/team-gear` page introduces the shop and links to the BSN SPORTS home page in a new tab. The dedicated Albany High School Bowling storefront URL has not been provided yet. When the club provides it, set `teamGearShop.teamStoreUrl` in `src/content/site.ts`. The button will then point to the team store, and the "link will be added here" note will disappear. Do not guess the URL.

## Build

Requires Node.js 22.

```bash
npm install
npm test
npm run build
npm run preview
```

`npm run build` typechecks the site and writes a static site in `dist/`. That folder is generated and is not stored in Git. Upload the contents of `dist/` for a manual Netlify deploy, or connect this repository to Netlify with the build command `npm run build` and the publish directory `dist`.

Do not add real student names, photos, scores, or account credentials to this repository.
