# SvelteKit Starter

An opinionated, kept-current starting point for SvelteKit apps deployed to
Cloudflare Workers.

## Stack

| Layer         | Choice                                                                |
| ------------- | --------------------------------------------------------------------- |
| Framework     | **SvelteKit 3** (RC) + Svelte 5, runes                                |
| Toolchain     | **Vite+** (`vp`) — Vite 8, Vitest, Oxlint, Oxfmt, tsc, in one command |
| Language      | TypeScript                                                            |
| Validation    | **Zod 4**                                                             |
| Content       | **Content Collections** — type-safe Markdown, compiled at build time  |
| UI primitives | **Bits UI** (headless), styled with **plain CSS** + design tokens     |
| Deploy target | **Cloudflare Workers** via `@sveltejs/adapter-cloudflare`             |
| Runtimes      | **mise** pins Node + pnpm; **pnpm** is the package manager            |
| CI/CD         | GitHub Actions — checks on every PR, deploy on merge to `main`        |

## Prerequisites

- [mise](https://mise.jdx.dev) — installs the pinned Node and pnpm

## Getting started

```sh
mise install        # Node + pnpm, per mise.toml
pnpm install        # app dependencies
pnpm dev            # http://localhost:5173
```

## Scripts

| Command             | What it does                                                   |
| ------------------- | -------------------------------------------------------------- |
| `pnpm dev`          | dev server (`vp dev`)                                          |
| `pnpm build`        | production build for Cloudflare (`vp build`)                   |
| `pnpm preview`      | run the built worker locally with `wrangler dev`               |
| `pnpm check`        | **format + lint + typecheck** in one pass (`vp check`)         |
| `pnpm check:fix`    | same, auto-fixing what it can                                  |
| `pnpm check:svelte` | `.svelte` type / a11y / template diagnostics (`svelte-check`)  |
| `pnpm test`         | unit tests (`vp test`, Vitest)                                 |
| `pnpm sync`         | regenerate `.svelte-kit/`, Cloudflare types, and content types |
| `pnpm deploy`       | build + `wrangler deploy` (usually left to CI)                 |

`pnpm check` covers `.ts`/`.js`; Oxlint does not parse `.svelte`, so
`pnpm check:svelte` is the separate step for component diagnostics. Oxfmt _does_
format `.svelte` (it bundles `prettier-plugin-svelte`).

## Project layout

```
content-collections.ts     Zod-validated Markdown collections
src/
  app.css                  design tokens + reset (light/dark)
  content/posts/*.md        sample blog content
  lib/
    components/             Bits UI wrappers with scoped plain CSS
    schemas.ts              example Zod schema + inferred type
    utils.ts                small helpers, unit-tested
  routes/
    +page.svelte            home — Bits UI demo
    blog/                   list + [slug] detail, from Content Collections
vite.config.ts             SvelteKit + Vite+ (`fmt` / `lint` / `test`) config
```

Import helpers from `#lib`, components/assets as `#lib/components/X.svelte`, and
compiled content from `#content` (all via `package.json` `imports`).

## Deployment

Push to `main` → GitHub Actions runs the checks, then deploys to Cloudflare
Workers. First-time setup (Cloudflare secrets, branch protection) is in
[SETUP.md](./SETUP.md).

## Notes on the bleeding edge

SvelteKit 3 and Vite+ are pre-release. `mise.toml` and the lockfile pin exact
versions; Dependabot proposes grouped bumps weekly. `pnpm-workspace.yaml` sets
`minimumReleaseAge: 0` (this repo tracks newest) — raise it for real projects.
