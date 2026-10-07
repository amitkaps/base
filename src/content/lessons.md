---
title: Lessons
summary: "SvelteKit 3 + Vite + Cloudflare gotchas found building this — for humans and agents."
order: 4
---

What it actually took to wire SvelteKit 3 + Vite + Cloudflare together.
Useful if you're extending this — human or agent.

## SvelteKit 3

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
  the Vite pipeline (`oxlint --type-aware`, `svelte-check`) needs a `svelte-kit sync` first,
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

## Toolchain

- **No Vite+.** It ran Vite, Vitest, Oxlint and Oxfmt behind one `vp` command
  and one config. It was dropped because the price outgrew the benefit. Every
  `vite` consumer (SvelteKit, the adapter, Vitest) had to be redirected to
  `@voidzero-dev/vite-plus-core` by a `pnpm-workspace.yaml` override, which then
  needed `peerDependencyRules.allowAny: [vite]`, so pnpm stopped checking Vite
  peer ranges. With format and lint at defaults, the one config had nothing left
  to unify. The standalone tools are the same binaries, are tracked by Dependabot
  one by one, and need no override.
- **Oxlint runs on flags, not a config file.** `--type-aware --import-plugin
  --deny-warnings` in the `lint` script. The `typescript`, `unicorn` and `oxc`
  plugins and the `correctness` category are on by default, and
  `--deny-warnings` makes them fail the check. It reads `.gitignore`, so
  generated files are skipped without ignore patterns.
- **Type-aware lint needs `oxlint-tsgolint` as a direct dependency.** Oxlint
  doesn't install it. Without it, `--type-aware` fails with "Failed to find
  tsgolint executable". Oxlint's `typeCheck` option isn't used: `svelte-check`
  already type-checks.
- **Oxfmt skips `.svelte` unless told.** That needs a config file, since it reads
  no `package.json` key, hence the one-line `.oxfmtrc.json`. (Oxfmt reads the
  `fmt` block of `vite.config.ts` only when launched by Vite+.)
- **An old lockfile keeps Vite+.** `oxlint` and `oxfmt` list `vite-plus` as an
  optional peer, so a lockfile that already resolved it keeps installing it after
  the devDependency is removed. `pnpm dedupe` doesn't clear it. Regenerate the
  lockfile.
- **An empty test suite fails.** `vitest run` exits 1 when it finds no test
  files, so a fork that removes the tests breaks CI until it adds one back (or
  sets `passWithNoTests` while it has none).
- **No Vitest guard needed on `adapter-cloudflare` 8.0.0+.** Earlier
  versions started wrangler's `getPlatformProxy()` from the Vite
  `configureServer` hook and never disposed it, so tests passed and Vitest then
  hung 10s printing "close timed out … something prevents 2 Vite servers from
  exiting" ([sveltejs/kit#17215](https://github.com/sveltejs/kit/issues/17215)).
  If you see that on an older adapter, skip the plugins under `process.env.VITEST`.

## pnpm 12

- Settings moved from `.npmrc` / `package.json#pnpm` to `pnpm-workspace.yaml`.
- `onlyBuiltDependencies` is now an `allowBuilds:` map (`esbuild: true`, …).
- `minimumReleaseAge` blocks packages published in the last N minutes — a
  supply-chain guard, configured in `setup.md` §5.

## Node & pnpm versions

- **`package.json` is the one place.** `devEngines` (`runtime` + `packageManager`,
  `onFail: error`) makes a wrong Node or pnpm fail the install loudly; `engines`
  and `packageManager` are what CI reads (`actions/setup-node` with
  `node-version-file: package.json`, and `pnpm/action-setup`). mise reads the
  same file when `idiomatic_version_file_enable_tools` is on, so there's no
  `mise.toml` or `.node-version` to keep in sync.

## Editor

- **The Svelte VS Code extension can't read the config yet.** With no
  `svelte.config.js`, it looks for the Svelte plugin in `vite.config.ts` and fails
  with "No Svelte configuration found in vite config" on line 1 of every
  `.svelte` file, and `<script>` blocks lose their highlighting. Nothing is
  wrong with the code: `svelte-check` (run by `pnpm check`) is the source of
  truth. Re-test after the extension updates.

## TypeScript

- **Stay on TypeScript 6 for now.** TypeScript 7 (the native port) removes the
  JS API SvelteKit 3.0.0 uses to load `tsconfig.json`: every `svelte-kit sync`
  fails with "Cannot read properties of undefined (reading 'readFile')". Kit's
  peer range is `^6`, and `svelte-check` 4.7 allows `^5 || ^6`. Move when both
  widen their peers.

## Content

- Chose `import.meta.glob('/src/content/*.md', { query: '?raw', eager: true })` +
  [`@amitkaps/markz`](https://markz.amitkaps.com) over Content Collections: no
  config file, no codegen step, no sync ordering. It all lives in `src/lib/docs.ts`.
- **Each page's metadata is a `---` block** — `title`, `summary`, `order` — read
  by markz and validated by a Zod schema. The slug is the filename. Adding a page
  is adding one file, and a missing or mistyped key fails the build naming the
  file. Extend the schema for more fields.
- **markz's metadata is a flat `key: value` block**, not full YAML: no nesting,
  lists only as `[a, b]`, and a value YAML would read differently (`no`, a bare
  date) warns rather than guessing. Quote it.
- **One parser replaces `marked`, `yaml` and the glue.** markz also gives heading
  ids (unique per page, any script) and curly punctuation, which used to be a
  custom renderer and a `walkTokens` pass.
- **Any markz warning fails the build.** It keeps unsupported syntax (raw HTML,
  `*emphasis*`, `__strong__`, reference links, bare URLs, ...) as literal text and
  warns, so `render` in `src/lib/docs.ts` throws with the file, line and the form to
  write instead. The dialect is in [markz's syntax doc](https://markz.amitkaps.com).
- Rendering happens at build time (pages are prerendered), so `@amitkaps/markz`
  and `zod` never reach the client or the Worker — they are `devDependencies`.
- **Empty metadata values arrive as `null`.** A key written with nothing after it
  (`image:`) reads as `null`, and Zod's `.optional()` rejects `null`.
  `src/lib/docs.ts` drops null keys before validating.

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
- **Stay on `wrangler` — `cf` can't deploy SvelteKit yet.** Last tried with
  `cf` 1.0.0-beta.12, Cloudflare's successor CLI, after the switch to plain Vite. `cf migrate` turns
  `wrangler.jsonc` into a typed `cloudflare.config.ts`, and `cf workers types`
  replaces `wrangler types`. With the default Wrangler bundler, `assets.directory`
  moves to a separate `wrangler.config.ts`. With `--bundler vite`, it has nowhere
  to go and is left as a TODO. Either way, `cf deploy` fails. Its `pnpm vite build`
  now succeeds (it failed while this project used Vite+), but `cf deploy` uploads only
  cf's own Build Output (`.cloudflare/output/v0/`), and `adapter-cloudflare`
  doesn't write it. `--prebuilt` fails the same way. For Vite projects that
  output comes from `@cloudflare/vite-plugin`, and SvelteKit doesn't build
  through that plugin. cf's own framework table marks SvelteKit
  `supportsCf: false` and knows only majors up to 2. Moving just the config
  would leave `wrangler deploy` reading a second copy of it. Re-test when the
  adapter or `cf` supports this. Wrangler is maintained for 18 months after the
  `cf` beta ends.

## CI

- `pnpm/action-setup` + `actions/setup-node` (`node-version-file: package.json`,
  `cache: pnpm`) is all the setup needed. Every step runs through `pnpm run …`,
  so no global tooling in CI either.
- One job, not two: the deploy step is a guarded step at the end of `ci` rather
  than a separate job, so the build isn't repeated and there's no artifact to
  pass between jobs.
