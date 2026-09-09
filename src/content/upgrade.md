# Upgrade

`setup.md` is one-time. This is the recurring part: keeping a fork current
without breaking it. The stack is deliberately on the bleeding edge (SvelteKit 3
RC, Vite+ beta, `minimumReleaseAge: 0`), so bumps land often.

## The rhythm

- **Weekly** — Dependabot opens grouped PRs. Skim, merge the safe ones (below).
- **Monthly** — `pnpm outdated`; bump the toolchain (Vite+, SvelteKit RC)
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

Keep the `vite` override in `pnpm-workspace.yaml` and the `vite` devDependency
alias pinned to the **same** `@voidzero-dev/vite-plus-core` version — bump both
together, or the tree splits into two Vites again (see `lessons.md`).

## After any bump

```sh
pnpm install
pnpm check && pnpm check:svelte && pnpm test && pnpm build
```

- Re-run `pnpm gen` if `wrangler` moved (regenerates `worker-configuration.d.ts`).
- Deploy happens on merge to `main`; confirm `base.<subdomain>.workers.dev` and
  the custom domain still serve.

## Node & pnpm

Bump together: `.node-version`, `package.json` `engines.node`, and
`package.json` `packageManager`. CI reads `.node-version`, so that file is the
source of truth for the runtime.

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

## Graduating off the bleeding edge

Once SvelteKit 3 and Vite+ ship stable:

- Raise `minimumReleaseAge` in `pnpm-workspace.yaml` to `1440`+ (24h cooldown).
- Relax the RC version ranges in `package.json` to normal caret ranges.
- Delete this section.
