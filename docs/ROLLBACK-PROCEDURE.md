# ROLLBACK PROCEDURE

Use when a bad deploy or merge needs to be reversed. Prefer reversible, non-destructive steps. **Never force-push `main`.** Never delete or recreate the repository.

## A. Homepage content rollback (fastest UI rollback)

Live home is `HomeReview` (`src/pages/HomeReview.tsx` routed at `/`).

Rollback-only component: `src/pages/Home.tsx` (static mockup image).

1. In `src/App.tsx`, change the index route from `<HomeReview />` to `<Home />`.
2. Run `npm test` and `npm run build`.
3. Commit on a review branch, open PR, merge only with owner approval.
4. Confirm Netlify deploy for the merge commit before claiming LIVE.

## B. Git revert of a bad commit (preferred for shared history)

1. Identify the bad commit SHA on `main`.
2. `git revert <sha>` (creates a new commit; does not rewrite history).
3. Push the revert via normal PR workflow to `main` (owner merge).
4. Verify Netlify build for the revert commit.

If multiple commits are bad, revert newest-first or use a single revert range carefully reviewed.

## C. Netlify publish rollback (hosting)

1. Open the Netlify site deploy history for `albany-hs-bowling`.
2. Locate the last known-good **production** deploy (confirm by commit SHA / preview).
3. Use Netlify’s “Publish deploy” / rollback control for that deploy.
4. Re-check `https://albany-hs-bowling.netlify.app/` and critical routes (`/`, `/team-gear`, `/volunteer`, `/staff/login`).
5. Record the rolled-back deploy ID and SHA in the incident note — do not invent confirmation.

## D. Feature flag rollback (auth / staff)

If staff auth was enabled and must be turned off:

1. In Netlify env: set `VITE_ADMIN_AUTH_ENABLED=false` and `ADMIN_AUTH_ENABLED=false` (or remove them).
2. Trigger a new deploy (required for `VITE_*`).
3. Confirm `/staff/login` shows the gated “not open” state.

Do **not** leave half-enabled Identity + open registration.

## E. Content publish rollback

Published editable content lives in `src/content/published/*.json` (and related content modules).

1. Revert the Git commit that published bad content, **or** restore the previous JSON from git history and commit.
2. Do not edit production via undocumented API shortcuts.
3. Drafts under `content/drafts/` must never be treated as live.

## After any rollback

- [ ] `npm test` / `npm run build` green on the recovery branch
- [ ] PR reviewed / merged by owner when code recovery is required
- [ ] Live URL checked with evidence (status + key pages)
- [ ] Update `CHANGELOG.md` with a factual rollback entry
