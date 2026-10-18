# Albany High School Bowling

Public website source for the Albany High School Bowling club site. This repository is the editable React, TypeScript, and Vite project for the public pages.

It does not include private student records, coach or player administration, guardian accounts, photo galleries, payment processing, or the club's other project archives.

## Pages

Home, Our Club, Practices, Tournaments, Team Gear, Sponsors, Fundraisers, Bowling Resources, Contact, FAQ, and Bowl-a-Thon.

Sign In explains that team accounts are not open. Team Gear is a preview. Add to cart stays off, and there are no prices or checkout.

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
