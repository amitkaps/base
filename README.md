# SvelteKit Starter

An opinionated, kept-current starting point for SvelteKit apps deployed to
Cloudflare Workers. Two configs that matter: **`vite.config.ts`** (dev +
toolchain) and **`wrangler.jsonc`** (deploy).

## Stack

| Layer         | Choice                                                                                                         |
| ------------- | -------------------------------------------------------------------------------------------------------------- |
| Framework     | **SvelteKit 3** (RC) + Svelte 5, runes                                                                         |
| Toolchain     | **Vite+** (`vp`) — Vite 8, Vitest, Oxlint, Oxfmt, tsc, and Node + pnpm, in one tool                            |
| Language      | TypeScript                                                                                                     |
| Validation    | **Zod 4** — forms (`src/lib/schemas.ts`) and markdown frontmatter                                              |
| Content       | Markdown blog via `import.meta.glob` + `js-yaml` + `marked` + Zod (`src/lib/posts.ts`) — no plugin, no codegen |
| UI primitives | **Bits UI** (headless), styled with **plain CSS** + design tokens                                              |
| Deploy        | **Cloudflare Workers** via `@sveltejs/adapter-cloudflare`                                                      |
| CI/CD         | GitHub Actions — checks on every PR, deploy on merge to `main`                                                 |

## Getting started

Vite+ is the one tool you install; it brings Node and pnpm.

```sh
curl -fsSL https://vite.plus | bash     # or: mise use -g npm:vite-plus  /  npm i -g vite-plus

vp install     # Node (per package.json), pnpm, and dependencies
vp dev         # http://localhost:5173
```

## Scripts

| Command               | What it does                                                  |
| --------------------- | ------------------------------------------------------------- |
| `vp dev` / `pnpm dev` | dev server                                                    |
| `vp build`            | production build for Cloudflare                               |
| `vp preview`          | run the built worker locally                                  |
| `pnpm check`          | **format + lint + typecheck** (`svelte-kit sync && vp check`) |
| `pnpm check:svelte`   | `.svelte` type / a11y / template diagnostics                  |
| `vp test`             | unit tests (Vitest)                                           |
| `pnpm deploy`         | build + `wrangler deploy` (normally left to CI)               |
| `pnpm gen`            | regenerate Cloudflare types after editing `wrangler.jsonc`    |

`vp check` covers `.ts`/`.js` (and formats `.svelte`); Oxlint doesn't parse
`.svelte`, so `pnpm check:svelte` is the separate step for component diagnostics.

## Project layout

```
src/
  app.css                  design tokens + reset (light/dark)
  content/posts/*.md        blog content (frontmatter + markdown)
  lib/
    posts.ts                glob + YAML + Zod + marked — the content loader
    schemas.ts              example Zod schema + inferred type
    utils.ts                small helpers, unit-tested
    components/             Bits UI wrappers with scoped plain CSS
  routes/
    +page.svelte            home — Bits UI demo
    blog/                   list + [slug] detail, prerendered
vite.config.ts             SvelteKit + Vite+ (fmt / lint / test) config
wrangler.jsonc             Cloudflare deploy config
```

Import helpers, schemas and posts from `#lib`; components/assets as
`#lib/components/X.svelte` (via `package.json` `imports`).

## Deployment

Push to `main` → GitHub Actions runs the checks, then deploys to Cloudflare
Workers. One-time setup (Cloudflare secrets, branch protection) is in
[SETUP.md](./SETUP.md).

## Notes on the bleeding edge

SvelteKit 3 and Vite+ are pre-release. The lockfile pins exact versions and
Dependabot proposes grouped bumps weekly. `pnpm-workspace.yaml` sets
`minimumReleaseAge: 0` (this repo tracks newest) — raise it for real projects.
