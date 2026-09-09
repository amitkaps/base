# Stack

An opinionated, kept-current base for SvelteKit apps on Cloudflare Workers. Two
config files carry the weight: **`vite.config.ts`** (dev + toolchain) and
**`wrangler.jsonc`** (deploy).

## What's in it

| Layer      | Choice                         | Why                                                 |
| ---------- | ------------------------------ | --------------------------------------------------- |
| Framework  | SvelteKit 3 (RC) + Svelte 5    | Runes, prerendered by default                       |
| Toolchain  | Vite+ (`vp`)                   | Vite, Vitest, Oxlint, Oxfmt, tsc behind one command |
| Language   | TypeScript                     | —                                                   |
| Validation | Zod 4                          | Validates the parsed docs in `src/lib/docs.ts`      |
| Content    | `import.meta.glob` + `marked`  | Markdown pages, no plugin, no codegen               |
| UI         | Bits UI + plain CSS            | Headless primitives, tokens in `src/app.css`        |
| Deploy     | `@sveltejs/adapter-cloudflare` | Cloudflare Workers                                  |
| CI/CD      | GitHub Actions                 | Checks on every PR, deploy on merge to `main`       |

## Getting a copy running

You need **Node 24** and **pnpm 12** — via [mise](https://mise.jdx.dev), nvm,
or Corepack. `.node-version` and `package.json` (`engines`, `packageManager`)
declare both.

```sh
pnpm install
pnpm dev      # http://localhost:5173
```

`vp` is a dev dependency, invoked through the scripts below — no global install.

## Scripts

| Command             | Does                                                       |
| ------------------- | ---------------------------------------------------------- |
| `pnpm dev`          | dev server                                                 |
| `pnpm build`        | production build for Cloudflare                            |
| `pnpm preview`      | run the built worker locally                               |
| `pnpm check`        | format + lint + typecheck (`svelte-kit sync && vp check`)  |
| `pnpm check:svelte` | `.svelte` type / a11y / template diagnostics               |
| `pnpm test`         | unit tests (Vitest, via `vp test`)                         |
| `pnpm deploy`       | build + `wrangler deploy` (normally left to CI)            |
| `pnpm gen`          | regenerate Cloudflare types after editing `wrangler.jsonc` |

Oxlint doesn't parse `.svelte`, so `check` covers `.ts`/`.js` and `check:svelte`
is the separate component pass. Oxfmt _does_ format `.svelte`.

## Layout

```
src/
  app.css                  design tokens + reset (light/dark)
  content/*.md              these three docs — the content demo
  lib/
    docs.ts                 glob + marked + Zod — loads src/content, unit-tested
    components/             Bits UI wrappers, scoped plain CSS
  routes/
    +page.svelte            home — links to the docs + a Bits UI demo
    [slug]/                 renders one doc; prerendered from docs list
vite.config.ts             SvelteKit + Vite+ (fmt / lint / test) config
wrangler.jsonc             Cloudflare deploy config
```

Import helpers, schemas and docs from `#lib`; components and assets directly as
`#lib/components/X.svelte` (see `package.json` `imports`).

## Tracking the bleeding edge

SvelteKit 3 and Vite+ are pre-release. The lockfile pins exact versions;
Dependabot proposes grouped bumps weekly. `pnpm-workspace.yaml` sets
`minimumReleaseAge: 0` so fresh releases aren't held back — raise it (minutes)
for real projects.
