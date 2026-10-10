---
title: Setup
summary: "Make it yours: Cloudflare, branch protection, supply chain."
---

One-time steps to turn this starter into a real project. Everything else is
already wired.

## 1. Rename

- `package.json` → `name`
- `wrangler.toml` → `name` (this becomes the Workers subdomain)
- the docs in `docs/` (`design.md`, `setup.md`, `upgrade.md`, `plan.md`,
  `lessons.md`, `development.md`) — make them yours. Each carries its `title`
  and `summary` in frontmatter, and `docs/README.md`'s `nav` sets their order

## 2. Cloudflare

Deploys come from Cloudflare's Git integration (Workers Builds), not from
GitHub Actions, so there's no API token or secret to keep.

1. In the Cloudflare dashboard, create a Worker connected to this GitHub
   repo. Its name must match `name` in `wrangler.toml`.
2. Set its build settings. They're the same in every project, because the
   steps themselves live in `package.json`:

   ```text
   Build command    pnpm run verify
   Deploy command   pnpm run ship
   Root directory   /
   NODE_VERSION     26
   ```

`verify` runs `check`, `test` and `build`, so a failing check stops the deploy.
`ship` uploads what `verify` built. Each push to `main` deploys, and other
branches get preview URLs.

First manual deploy, if you want one before connecting the repo:

```sh
pnpm exec wrangler login
pnpm run verify && pnpm run ship
```

Write `pnpm run ship`, never `pnpm deploy`: `deploy` is a built-in pnpm command
and never reaches a script.

The Worker is reachable at `<name>.<your-subdomain>.workers.dev`.

## 3. Custom domain

`wrangler.toml` has a `routes` entry mapping the Worker to a hostname. Point it
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

pnpm holds back a version for a day after it's published (its default
`minimumReleaseAge`), so a compromised release has time to be pulled. This
starter keeps that default, and `pnpm-workspace.yaml` lets only our own
packages skip it, since each reaches npm only after a 2FA approval:

```yaml
minimumReleaseAgeExclude:
  - "@amitkaps/*"
```

A fork that depends on none of them can drop the exclusion. It's the only
place the cooldown is configured or documented.

---

That's the one-time setup. See `upgrade.md` (`/upgrade`) for keeping the fork
current afterwards.
