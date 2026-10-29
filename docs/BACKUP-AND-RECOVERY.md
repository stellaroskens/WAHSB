# BACKUP AND RECOVERY

## Primary source of truth

| Asset | Location | Recovery method |
| --- | --- | --- |
| Application source | GitHub `stellaroskens/WAHSB` | Clone / checkout prior commit |
| Published site content | `src/content/published/` in git | Restore file from git history |
| Content drafts | `content/drafts/` in git (not live) | Restore from git; never auto-publish |
| Static assets | `public/` in git | Restore from git |
| Netlify build output | Generated `dist/` (not in git) | Rebuild with `npm run build` |
| Netlify Identity users | Netlify Identity (when enabled) | Netlify dashboard / provider recovery — **owner-controlled** |
| Environment secrets | Netlify UI env vars (not in git) | Re-enter from owner secret store; never commit |

## What is intentionally not backed up in this repo

- Student private records
- Payment processor credentials
- SMTP / API secrets
- Local `.env` files (gitignored)

## Routine backup expectations

1. **Git remote is the backup.** Every accepted change should exist on GitHub via PR.
2. Before risky content publishes, ensure `main` (or the release branch) is pushable and CI/tests are green.
3. Keep a private owner copy of Netlify env var names and values outside the repo.
4. Do not rely on a developer laptop as the only copy.

## Recovery scenarios

### Lost local working copy

```bash
git clone https://github.com/stellaroskens/WAHSB.git
cd WAHSB
npm install
npm test
npm run build
```

### Bad content published

Follow `ROLLBACK-PROCEDURE.md` section E (revert publish commit or restore JSON).

### Site down after deploy

1. Confirm GitHub `main` SHA.
2. Check Netlify deploy logs for the failing build.
3. Publish last known-good deploy (Netlify rollback) while fixing forward on a branch.

### Secrets leaked into git

1. Rotate the secret immediately at the provider.
2. Remove from history only with owner-approved, carefully planned process — **default is rotate + stop using**, not force-push.
3. Ensure `.gitignore` continues to exclude `.env`, keys, and `.netlify`.

## Verification after recovery

- `npm test` and `npm run build` succeed
- Critical public routes load
- Staff auth remains in the intended gated state
- Payment destinations remain disabled unless owner verified them
