---
title: Design
summary: "Every piece in the starter, and why it was chosen."
---

An opinionated, kept-current base for SvelteKit apps on Cloudflare Workers. Two
config files carry the weight: **`vite.config.ts`** (dev + toolchain) and
**`wrangler.toml`** (deploy).

## What's in it

| Layer      | Choice                         | Why                                            |
| ---------- | ------------------------------ | ---------------------------------------------- |
| Framework  | SvelteKit 3 + Svelte 5         | Runes, prerendered by default                  |
| Toolchain  | Vite+                          | The one toolchain every repository shares      |
| Language   | TypeScript                     | —                                              |
| Validation | Zod 4                          | Validates the parsed docs in `src/lib/docs.ts` |
| Content    | `import.meta.glob` + markz     | Markdown pages, no plugin, no codegen          |
| Styling    | Plain CSS                      | Tokens in `src/app.css`, no framework          |
| Deploy     | `@sveltejs/adapter-cloudflare` | Cloudflare Workers                             |
| CI         | GitHub Actions                 | Checks on every PR and push to `main`          |
| CD         | Workers Builds (Git)           | Deploys `main`, previews other branches        |

No UI library is bundled — add the one you want (Bits UI, Melt, your own) when
you need it.

## Seven commands

| Command       | Does                                                        |
| ------------- | ----------------------------------------------------------- |
| `pnpm dev`    | dev server on <http://localhost:5173>                       |
| `pnpm build`  | production build for Cloudflare                             |
| `pnpm check`  | format + lint + typecheck + `.svelte` type/a11y diagnostics |
| `pnpm fix`    | writes the format and lint fixes                            |
| `pnpm test`   | unit tests (Vitest, through `vp test`)                      |
| `pnpm verify` | `check` + `test` + `build`: what CI and every deploy run    |
| `pnpm ship`   | `wrangler deploy` of the last build (normally left to CD)   |

`pnpm check` runs `vp check`, then `svelte-check`. `vp check` formats, lints
and type-checks the `.ts` and `.js`, from the `fmt` and `lint` blocks of
`vite.config.ts`. `svelte-check` adds the `.svelte` types and the template and
a11y diagnostics. Before both, `svelte-kit sync` and `wrangler types` write the
generated types they read.

Escape hatches, when you want them directly:

```sh
pnpm exec vp lint          # lint alone
pnpm exec vp test          # watch mode
pnpm exec vp preview       # run the built worker locally
```

`prepare` (on every `pnpm install`) runs `svelte-kit sync` and `wrangler types`,
so a fresh clone typechecks with no extra step. `worker-configuration.d.ts` is
generated, not committed.

## Layout

```
docs/
  README.md                the docs' order, as nav in its metadata
  *.md                     these docs — the site's pages and the content demo
src/
  app.css                  design tokens, reset, and prose (dark)
  lib/
    docs.ts                 glob + markz + Zod — loads docs/, unit-tested
  routes/
    +page.svelte            home — links to the docs
    docs/[slug].md/         renders one doc at /docs/<file>.md; prerendered
vite.config.ts             SvelteKit, format, lint and test config
wrangler.toml              Cloudflare deploy config
```

Import helpers, schemas and docs from `#lib`; components and assets directly as
`#lib/components/X.svelte` (see `package.json` `imports`).

SvelteKit 3 and the Oxc tools move fast, so this repo tracks their releases
closely — see `upgrade.md` (`/docs/upgrade.md`) for the rhythm, and `setup.md`
(`/docs/setup.md`) for the supply-chain settings a real project should tighten.
