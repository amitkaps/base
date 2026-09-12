# Lessons

What it actually took to wire SvelteKit 3 RC + Vite+ + Cloudflare together.
Useful if you're extending this — human or agent.

## SvelteKit 3 (RC)

- **No `svelte.config.js`.** Adapter and compiler options are passed inline to
  `sveltekit()` in `vite.config.ts`.
- **That config is flat.** Options such as `files` or `prerender` go straight
  into `sveltekit({ ... })`. Wrapping them in a `kit` key, as in SvelteKit 2,
  fails with "configuration no longer lives inside a `kit` namespace".
- **`$lib` is gone** — it's `#lib`, a `package.json` `imports` subpath. An
  extensionless `#lib/thing` doesn't resolve inside `.svelte` files, so re-export
  everything through a `src/lib/index.ts` barrel and import `#lib`. Components and
  assets (which have extensions) can be imported directly: `#lib/components/X.svelte`.
- **`$app/tsconfig` is virtual** — `svelte-kit sync` writes it to
  `node_modules/$app/tsconfig.json`. Anything that reads `tsconfig.json` outside
  the Vite pipeline (`vp check`, `svelte-check`) needs a `svelte-kit sync` first,
  hence the `svelte-kit sync` at the front of the `check` script.
- The whole site is static, so `src/routes/+layout.ts` does
  `export const prerender = true` **and** `export const csr = false`. Without
  the second, every prerendered page still ships the hydration runtime for no
  benefit. A route with real client behaviour sets `csr = true` in its own
  `+page.ts`.
- **Prerendering is strict.** `handleHttpError` in `vite.config.ts` throws, so a
  broken internal link fails the build — a link checker for free. If a path is
  served by something other than this app, add it to the allowlist there rather
  than loosening the handler.

## Vite+

- **No global `vp` needed.** It's a dev dependency resolved from
  `node_modules/.bin`, so teammates only need Node and pnpm. (VoidZero's own
  templates assume a global `vp` — that also works, it's just not required.)
- **Config lives in `vite.config.ts`**, in `fmt` / `lint` / `test` / `check`
  blocks — not `.oxfmtrc` / `.oxlintrc`. Use `defineConfig` from `vite-plus`.
- **Deduplicate Vite.** SvelteKit's peers pull a real `vite`, while Vite+ wants
  `@voidzero-dev/vite-plus-core`. Left alone you get two. Fix: a
  `pnpm-workspace.yaml` override — `'vite@*': 'npm:@voidzero-dev/vite-plus-core@<v>'` —
  plus keep `vite` as a dev dependency alias so pnpm has the edge. This is what
  `vp migrate` does.
- **Tests import from `vite-plus/test`**, not `vitest` (not a direct dep) and not
  `@voidzero-dev/vite-plus-test` (removed in 0.3.x). You can drop the `vitest`
  dependency entirely.
- **`vp check` runs the tools directly**, not through Vite — so it won't run
  `svelte-kit sync` for you.
- **An empty test suite fails.** `vp test` exits 1 when it finds no test
  files, so a fork that removes the tests breaks CI until it adds one back (or
  sets `passWithNoTests` while it has none).
- **Guard the SvelteKit plugin out of Vitest** (`process.env.VITEST`) or you hit
  "The configured Vite SSR environment must be a RunnableDevEnvironment".

## TypeScript

- **Stay on 6.x for now.** TypeScript 7 (the native port) breaks `svelte-kit
sync`, Vite+'s config resolution (`Cannot read properties of undefined
(reading 'readFile')`) and `svelte-check` — all three still expect the 6.x
  JS API. Dependabot will keep proposing it; re-test when svelte-check and
  Vite+ ship native-port support.

## pnpm 12

- Settings moved from `.npmrc` / `package.json#pnpm` to `pnpm-workspace.yaml`.
- `onlyBuiltDependencies` is now an `allowBuilds:` map (`esbuild: true`, …).
- `minimumReleaseAge` blocks packages published in the last N minutes — a
  supply-chain guard, configured in `setup.md` §5.
- On an Intel Mac, mise can't install pnpm 12 from the default (aqua) backend —
  no `darwin-x64` build. Use `"github:pnpm/pnpm"`.

## Content

- Chose `import.meta.glob('/src/content/*.md', { query: '?raw', eager: true })` +
  `marked` + a `/^#\s+(.+)$/m` title regex over Content Collections: no config
  file, no codegen step, no sync ordering. ~30 lines in `src/lib/docs.ts`.
- These docs carry **no frontmatter** — the title comes from the H1, and nav
  order + card copy live in one `NAV` array. So the same file reads cleanly on
  GitHub and renders on the site.
- If you do want frontmatter: `gray-matter` pulls a transitive direct `eval`
  (Rolldown warns). Use `js-yaml`'s `load` on the `---` block yourself instead.
- Rendering happens at build time (pages are prerendered), so `marked` never
  reaches the client or the Worker.
- **`marked` adds no heading ids**, so `#section` links resolve to nothing and
  nobody notices. `src/lib/docs.ts` adds a heading renderer that slugs each
  heading and keeps ids unique per page.
- **`Marked` is a top-level export.** Use `import { Marked } from 'marked'` and
  `new Marked()` when you need an instance with extensions; `new marked.Marked()`
  is not a constructor.
- **With frontmatter, empty values arrive as `null`.** A key written with
  nothing after it (`image:`) parses to `null`, and Zod's `.optional()` rejects
  `null`. Drop null keys before validating, or use `.nullish()`.
- **Typographic extensions should work on tokens, not finished HTML.**
  Post-processing the rendered string (as `marked-smartypants` does) also
  rewrites raw HTML blocks, where `--` or straight quotes may be meaningful. A
  `walkTokens` pass over `text` tokens leaves code and raw HTML untouched.

## Cloudflare

- `@sveltejs/adapter-cloudflare` writes `.svelte-kit/cloudflare`; `wrangler.jsonc`
  `main` + `assets.directory` point there.
- `worker-configuration.d.ts` is generated by `wrangler types`, not committed —
  the `prepare` and `check` scripts both regenerate it, so editing
  `wrangler.jsonc` needs no separate step.
- Once a build exists, that generated file points `Cloudflare.GlobalProps` at
  `.svelte-kit/cloudflare/_worker.js`, dragging the built worker into the
  TypeScript program. `"checkJs": false` in `tsconfig.json` keeps `pnpm check`
  from reporting errors in generated output.

## CI

- `pnpm/action-setup` + `actions/setup-node` (`node-version-file: .node-version`,
  `cache: pnpm`) is all the setup needed. Every step runs through `pnpm run …`,
  so no global tooling in CI either.
- One job, not two: the deploy step is a guarded step at the end of `ci` rather
  than a separate job, so the build isn't repeated and there's no artifact to
  pass between jobs.
