---
title: Upgrade
summary: "Keep a fork current: Dependabot, manual bumps, re-syncing with upstream."
order: 3
---

`setup.md` is one-time. This is the recurring part: keeping a fork current
without breaking it. The stack tracks the latest releases (SvelteKit 3, Vite+
1.0, no release cooldown), so bumps land often.

## The rhythm

- **Weekly** — Dependabot opens grouped PRs. Skim, merge the safe ones (below).
- **Monthly** — `pnpm outdated`; bump the toolchain (Vite+, SvelteKit)
  deliberately and smoke-test.
- **Every bump** — CI must be green before merge. Strict branch protection on
  `main` enforces this and auto-rebases the other open PRs after each merge.

## Dependabot PRs

Groups are defined in `.github/dependabot.yml`:

| Group             | Contents                                  | How to handle                           |
| ----------------- | ----------------------------------------- | --------------------------------------- |
| `minor-and-patch` | any minor/patch bump of a leaf dependency | merge on green CI                       |
| `sveltekit`       | `@sveltejs/*`, `svelte`, `svelte-check`   | pull the branch, smoke-test, then merge |
| `vite-plus`       | `vite`, `vite-plus`                       | pull the branch, smoke-test, then merge |
| github-actions    | workflow action versions                  | merge on green CI                       |

Smoke-test = `pnpm install && pnpm dev`, click through `/` and one doc page,
then `pnpm build`.

## Manual bumps

```sh
pnpm outdated
pnpm up --latest <pkg>        # or edit package.json + pnpm install
```

Bump Vite+ by editing the `vite-plus` entry under `catalog:` in `pnpm-workspace.yaml` — the devDependency and the `vite` override both follow it. `lessons.md` (`/lessons`) explains why. Dependabot's pnpm support isn't documented past v10, so don't expect it to bump that line.

## After any bump

```sh
pnpm install
pnpm check && pnpm test && pnpm build
```

`pnpm install` regenerates `worker-configuration.d.ts` via `prepare`, so a
`wrangler` bump needs nothing extra. Deploy happens on merge to `main`; confirm
`base.<subdomain>.workers.dev` and the custom domain still serve.

## Node & pnpm

Bump `package.json` — `devEngines`, `engines.node` and `packageManager` together.
CI reads `engines.node` and `packageManager` (via `pnpm/action-setup`), and
`devEngines` makes a local mismatch fail the install instead of drifting.

## Re-syncing a fork with upstream

```sh
git remote add upstream https://github.com/amitkaps/base
git fetch upstream
```

Periodically diff the toolchain files against upstream and cherry-pick fixes:

- `vite.config.ts`
- `pnpm-workspace.yaml`
- `.github/workflows/ci.yml`
- `src/lib/docs.ts`

New gotchas land in upstream `lessons.md` — worth re-reading after a big bump.
