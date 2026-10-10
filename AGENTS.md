# Working on this repo

Read **`src/content/lessons.md`** first. It covers the SvelteKit 3, Vite+, pnpm 12 and Cloudflare quirks this project already worked through.

## Standard

This repository follows the standard at [ship](https://ship.amitkaps.com), which sets how every repository builds, checks and deploys. Read [ship's docs/standard.md](https://github.com/amitkaps/ship/blob/main/docs/standard.md) before changing any of that.

- Change the toolchain, scripts, versions or deploys in ship first, then bring each repository in line. Don't change them in one repository alone.
- Work on a branch and open a pull request. CI runs `pnpm run verify`, which must pass, and the pull request is squash-merged. Nobody pushes to `main`.
- Run tools through `pnpm run …` and `pnpm exec`, not global installs.
- A held check on ship's page is a tool's limit, not a choice. Leave it until its reason goes away.

## Prose

Explanations go in `@prose` comments, written to the rules in [prose's usage](https://prose.amitkaps.com/docs/usage.md#for-agents). Read them before writing prose. They live there and aren't copied here, so every repository writes to the same rules.

## This repository

- Before committing, `pnpm check` (format, lint, types and Svelte diagnostics) and `pnpm test` must pass. After a dependency bump, run `pnpm build` too.
- The files in `src/content/` are the site's pages _and_ its docs. Update the doc, not a separate copy. Each fact lives in exactly one of them: `stack.md` (what's here), `setup.md` (one-time setup), `upgrade.md` (keeping current) and `lessons.md` (gotchas).
- `pnpm prose` reads the repository as a document. It's read-only, and opens the browser.
