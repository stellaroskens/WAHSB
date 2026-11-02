# AHSB staff guide

This guide is for coaches, the Club Administrator, and the Super Administrator. It describes what the website can do today. A screen that says a feature is off is telling the truth.

The public site is https://albany-hs-bowling.netlify.app/. Changes in a pull request are not on that site until the pull request is merged and Netlify finishes the deploy.

## Sign in

1. Open `/staff/login`.
2. Use the email address from your invitation and the password you created.
3. A coach opens the Coach dashboard. The Club Administrator opens the Club Administrator dashboard. The Super Administrator opens `/admin` and can also open the coach and club dashboards without using someone else's login.

Family sign-in is closed. The family tab explains that. It does not accept a family password.

## Edit a public page

Only a Super Administrator can open Website Pages at `/admin/content`.

1. Choose the page.
2. Change the text in the field. The help button next to a field explains where visitors see it.
3. Review the change. Reviewing does not save it.
4. Save a draft. Saving a draft writes to GitHub only when the site's content token is configured. It does not put the change on the public website.
5. Publish sends the approved draft to the content file in GitHub. The live website updates only after Netlify builds that commit.

If saving says the GitHub token is missing, stop. Do not paste the token into a page, a chat, or a content file. Add `GITHUB_CONTENT_TOKEN` in the Netlify site environment for Functions, then try again.

## Links

`/admin/links` lists public navigation links. A destination must be a public page or an approved web address. Staff addresses such as `/admin` are rejected.

## Burgerville

The current fundraiser is Burgerville on Sunday, November 8, 2026, 4:00 PM to 8:00 PM, at 2310 Santiam Highway SE, Albany. The participation code on the approved flyer is BVGIVES.

The page labels the event Upcoming, Happening now, or This date has passed from that date and time. After 8:00 PM Pacific on November 8, it will not stay labeled upcoming. The older Panda Express record stays in the content file and is not the current public fundraiser.

To change the wording, edit the Fundraisers page in Website Pages. Changing the words does not move the date by itself. The date and time used for the status come from the fundraiser record.

## Donations

`/donate` shows example amounts of $10, $25, $50, and $100. Those amounts are examples, not sponsorship packages. Reviewing an amount does not charge a card.

`/admin/donations` shows each payment method as Not connected until a verified destination, a private donation database, and an explicit live-payments switch all exist. The Activate live payments button stays disabled. Do not type a card number, bank account, or secret key into the website.

## Bowlers, coaches, and placeholders

Meet the Bowlers shows eight placeholder profiles and school logos. It does not show real students. Editing a placeholder is a draft until a Super Administrator publishes it. Publishing a real student still requires guardian approval and private storage, which are not ready.

## What you cannot do yet

- Import a spreadsheet of scores.
- Store parent or guardian records.
- Open family photo albums.
- Turn on live card, PayPal, Venmo, or Cash App checkout.
- Send a contact form or a Bowl-a-thon pledge through the website. Those forms say that nothing was sent.

The feature tracker in `docs/FEATURE_TRACKER.md` lists what is still missing.
