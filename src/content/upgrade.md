---
title: Upgrade
summary: "Keep a fork current: bumps, smoke tests, re-syncing with upstream."
order: 3
---

`setup.md` is one-time. This is the recurring part: keeping a fork current
without breaking it. The stack tracks the latest releases (SvelteKit 3, Vite 8),
as soon as pnpm's one-day wait has passed, so bumps land often.

## The rhythm

- **Monthly** — `pnpm outdated`; bump SvelteKit deliberately and smoke-test.
  Vite+ and the workflow actions aren't bumped here: they move in every
  repository at once, from [ship](https://ship.amitkaps.com), whose survey
  flags a repository that's behind. Vite+'s override in `pnpm-workspace.yaml`
  moves with it.
- **Every bump** — CI must be green before merge. Strict branch protection on
  `main` enforces this and auto-rebases the other open PRs after each merge.

There's no Dependabot: every pull request it opened duplicated ship's survey.
A fork that doesn't follow ship can add a `.github/dependabot.yml` of its own.

Smoke-test = `pnpm install && pnpm dev`, click through `/` and one doc page,
then `pnpm build`.

## Manual bumps

```sh
pnpm outdated
pnpm up --latest <pkg>        # or edit package.json + pnpm install
```

Every tool is a plain devDependency, so there are no overrides or catalog
entries to keep in step.

## After any bump

```sh
pnpm install
pnpm verify
```

`pnpm install` regenerates `worker-configuration.d.ts` via `prepare`, so a
`wrangler` bump needs nothing extra. Workers Builds deploys on merge to `main`; confirm
`base.<subdomain>.workers.dev` and the custom domain still serve.

## Node & pnpm

Bump `package.json` — `devEngines`, `engines.node` and `packageManager` together.
CI reads `engines.node` and `packageManager` (via `pnpm/action-setup`). A newer
global pnpm doesn't matter: `devEngines` downloads and runs the pinned one.

## Re-syncing a fork with upstream

```sh
git remote add upstream https://github.com/amitkaps/base
git fetch upstream
```

Periodically diff the toolchain files against upstream and cherry-pick fixes:

- `vite.config.ts`
- `package.json` scripts
- `pnpm-workspace.yaml`
- `.github/workflows/ci.yml`
- `src/lib/docs.ts`

New gotchas land in upstream `lessons.md` — worth re-reading after a big bump.
