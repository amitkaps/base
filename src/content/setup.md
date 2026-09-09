# Setup

One-time steps to turn this starter into a real project. Everything else is
already wired.

## 1. Rename

- `package.json` → `name`
- `wrangler.jsonc` → `name` (this becomes the Workers subdomain)
- this file and `stack.md` / `lessons.md` — make them yours

## 2. Cloudflare

1. Create an API token at
   <https://dash.cloudflare.com/profile/api-tokens> with the **Edit Cloudflare
   Workers** template.
2. Get your **Account ID** from any zone's overview page (or `wrangler whoami`).
3. Add both as GitHub Actions secrets (repo → Settings → Secrets and variables →
   Actions):
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
4. Optional: a `production` environment (Settings → Environments) lets you
   require approval before deploys. The `deploy` job already targets it.

First manual deploy, if you want one before merging:

```sh
pnpm exec wrangler login
pnpm deploy
```

The Worker is reachable at `<name>.<your-subdomain>.workers.dev`.

## 3. Custom domain

`wrangler.jsonc` has a `routes` entry mapping the Worker to a hostname. Point it
at your domain (the zone must be on the same Cloudflare account) — Cloudflare
creates the DNS record and certificate on the next deploy:

```jsonc
"routes": [{ "pattern": "app.example.com", "custom_domain": true }]
```

Remove the entry to deploy to `workers.dev` only.

## 4. Branch protection + PR workflow

Requires the [`gh`](https://cli.github.com) CLI, authenticated.

```sh
OWNER_REPO="your-org/your-repo"

# Require the CI check + a PR before merging to main
gh api -X PUT "repos/$OWNER_REPO/branches/main/protection" --input - <<'JSON'
{
  "required_status_checks": { "strict": true, "contexts": ["ci"] },
  "enforce_admins": true,
  "required_pull_request_reviews": { "required_approving_review_count": 0 },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON

# Merge hygiene
gh api -X PATCH "repos/$OWNER_REPO" \
  -F allow_squash_merge=true \
  -F allow_merge_commit=false \
  -F allow_rebase_merge=false \
  -F delete_branch_on_merge=true
```

Raise `required_approving_review_count` to `1` once more than one person works
on the repo.

## 5. Tighten the supply chain

For real projects, set a cooldown in `pnpm-workspace.yaml` so freshly published
versions are held back:

```yaml
minimumReleaseAge: 1440 # minutes (24h)
```
