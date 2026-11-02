# AHSB administrator setup

Public name: Albany High School Bowling (AHSB).

Repository: https://github.com/stellaroskens/WAHSB

Production: https://albany-hs-bowling.netlify.app/

The repository name and the Netlify project name stay WAHSB. Do not rename them to match the public abbreviation.

Checked November 1, 2026. Publishing was not configured. The old Netlify deploy named below was still public.

## Dashboards

Super Administrator, `/admin`

- Website pages, practices and tournaments, coaches, volunteers, fundraisers, and sponsor search text
- Connections, where social, email, and payment destinations stay off until verified
- Announcement drafts
- Staff invitations
- Media library. This reviews files already in the site. It does not upload student photos.
- Publishing history
- Site settings
- Publish. This is the only role that can publish.

Coach, `/coach`

- Coach dashboard
- Meet the Bowlers editor at `/coach/bowlers`
- Can save a draft of permitted bowler information
- Cannot publish
- Cannot open `/admin` or payment settings

Club Administrator, `/team-administrator`

- Club Administrator dashboard
- Meet the Bowlers editor at `/team-administrator/bowlers`
- Can save a draft of permitted bowler information
- Cannot publish
- Cannot open `/admin` or payment settings

The server reads the role from the Identity user. The name shown on the dashboard is display only.

Approved usernames already in the project are `cmeredith`, `cbreshears`, and `mfisher`. Do not invent email addresses. The super administrator must also be on `ADMIN_EMAIL_ALLOWLIST`.

## Staff sign-in

Netlify Identity must stay invitation-only. Do not turn on open registration.

In Netlify, set these only in the site environment, never in `netlify.toml` and never with a `VITE_` prefix on a secret:

- `ADMIN_AUTH_ENABLED` = `true`, for Functions
- `VITE_ADMIN_AUTH_ENABLED` = `true`, for Builds. This only shows the sign-in form. It does not grant a role.
- `ADMIN_EMAIL_ALLOWLIST` = the super administrator address already chosen for this site

After changing `VITE_ADMIN_AUTH_ENABLED`, trigger a new production deploy. Vite reads that flag at build time.

Google sign-in stays off until Identity → External providers → Google is enabled. Keep registration set to Invite only. A Google sign-in does not assign a staff role.

A live sign-in as each of the three roles has not been completed from this repository. Anonymous requests to `/admin`, `/admin/connections`, `/coach`, `/coach/bowlers`, `/team-administrator`, and `/team-administrator/bowlers` returned 302 to `/staff/login` on November 1, 2026.

## Draft and publishing workflow

Drafts and publication go through Netlify Functions. The browser never receives the GitHub token.

1. An authorized staff member edits a labeled form.
2. Save draft sends `POST /api/content/drafts`. The function checks the Identity session, then writes `content/drafts/{id}.json` on the configured branch. The default branch is `main`.
3. Preview in the editor is labeled `DRAFT PREVIEW — NOT PUBLISHED`. It does not change the public site.
4. Submit for approval uses the same draft endpoint and marks the draft pending. It still does not publish.
5. Publish sends `POST /api/content/publish`. Only a super administrator with `approve_publishing` can do this.
6. A successful response includes `commitSha`. If GitHub does not return a commit, nothing was saved.
7. Netlify then builds that GitHub commit. The commit and the live deploy are separate. Wait until the production deploy for that commit is published before treating the site as updated.

Do not publish a real student profile. The content check rejects a published profile that is not one of the placeholder cards.

Coaches and the Club Administrator can save bowler drafts. They do not see Publish. The server rejects a publish from any role other than super administrator.

## GitHub content token

`GITHUB_CONTENT_TOKEN` was not set on November 1, 2026. `GET /api/content/drafts` on production returned `github_token_missing`. No draft was saved, reloaded, or published in that check.

Create the token yourself. Do not paste it into chat, a pull request, a file in this repository, or any frontend variable.

1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.
2. Resource owner: `stellaroskens`. Repository access: Only select repositories → `WAHSB`.
3. Repository permissions: Contents → Read and write. Metadata stays Read-only. Leave every other permission at No access.
4. Do not create a classic personal access token.
5. Netlify → Project configuration → Environment variables → Add a variable.
6. Key: `GITHUB_CONTENT_TOKEN`. Mark it secret. Scope it to Functions, for production and deploy previews.
7. Do not also set a broad `GITHUB_TOKEN` for this purpose. The function uses `GITHUB_CONTENT_TOKEN` first.
8. Optional overrides, only if the defaults are wrong: `GITHUB_CONTENT_OWNER` (`stellaroskens`), `GITHUB_CONTENT_REPO` (`WAHSB`), `GITHUB_CONTENT_BRANCH` (`main`).
9. Redeploy production so the function reads the new variable.

After that, and only while signed in:

1. Add a fictional profile such as a new placeholder name in the Meet the Bowlers editor.
2. Save draft. Confirm the response includes a commit SHA and the editor does not claim success without one.
3. Reload the draft from the editor or `GET /api/content/drafts?id=...`.
4. Use the on-screen preview. Confirm the public Meet the Bowlers page does not show the fictional draft.
5. Do not publish until the site owner explicitly approves that publish.
6. After a publish, record the GitHub commit SHA and wait for a separate Netlify production deploy of that commit.

Those six checks were not run, because the token is not configured.

## Historical student draft

Current production source, the published content file, and the production JavaScript bundle do not contain the identifying student draft. `main` does not contain commit `21f003e`.

That commit is still reachable from closed pull request #4:

https://github.com/stellaroskens/WAHSB/commit/21f003e66a24d9567d2c9c148c662416bc1ba9e1

The removal patch in commit `78b8a8f` also shows the deleted record. Neither commit was merged to `main`. The branch `cursor/meet-the-bowlers` was deleted on GitHub. A local copy of that branch may still exist.

Netlify deploy `6ae4f56cbecf519b7c0e03d9` was still accessible on November 1, 2026:

https://6ae4f56cbecf519b7c0e03d9--albany-hs-bowling.netlify.app/

That URL returned HTTP 200, and its JavaScript bundle still contained the draft. Production did not.

Owner steps. Do not delete other deploys, and do not force-push.

1. Sign in to Netlify and open the site `albany-hs-bowling`.
2. Open Deploys and find deploy `6ae4f56cbecf519b7c0e03d9`.
3. Delete that deploy only. Locking a deploy keeps the files online, so lock is not removal.
4. Leave the current production deploy and unrelated preview deploys in place.
5. Open the permalink above in a private window. It should no longer serve the old site.
6. Do not rewrite `main`.

Then ask GitHub to remove the cached copies:

1. Open https://support.github.com/contact
2. Use the private-information process described at https://docs.github.com/en/site-policy/content-removal-policies/github-private-information-removal-policy
3. Include the repository `stellaroskens/WAHSB`, commits `21f003e66a24d9567d2c9c148c662416bc1ba9e1` and `78b8a8f`, and closed pull request #4.
4. State that the commits were not merged to `main`, the branch was deleted, and cached pull-request views still expose an unpublished student draft.
5. Do not force-push while that request is open unless GitHub asks for a history rewrite. A rewrite of `main` is not required, because `main` does not contain those commits.

Deleting the leftover local branch, after you no longer need to inspect it, does not change GitHub:

```bash
git branch -D cursor/meet-the-bowlers
```

## Still disabled

Family accounts stay closed until a private database, per-household authorization, and a privacy review exist. Do not send a family invitation from the public site.

Student photo upload, crop, and replace stay unavailable until private image storage and an approval step exist. A hidden or missing photo shows one selected school logo. The public page must not receive the private file.

Guardian consent is not saved. The consent function returns `consent_store_missing` or `consent_store_unwired` until `BOWLER_CONSENT_DATABASE_URL` points at a private database and a reviewed client writes only there. A checkbox is not guardian permission. Consent must not be stored in GitHub.

Email sending stays off. An announcement draft is not a sent message.

Payment activation stays off. No Stripe, PayPal, Venmo, or Cash App destination is verified. Coaches and the Club Administrator cannot open payment settings.

## Rollback

`src/pages/Home.tsx` is the previous homepage. It is not routed. Do not edit it to change the live home page. Restoring it requires a reviewed change to the route in `src/App.tsx`.

For published words, dates, and placeholder profiles:

1. Open `/admin/history` as super administrator.
2. Load the older published version into the editor. That load is not yet public.
3. Publish only if you intend to replace the live content file.
4. Wait for the Netlify deploy of that new commit.

To undo a content commit with Git, revert that commit in a normal pull request. Do not force-push `main`.

If `GITHUB_CONTENT_TOKEN` is missing, history cannot be loaded from GitHub and a publish does not succeed. The public site stays on the last deployed commit.
