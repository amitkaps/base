# base

An opinionated, kept-current starter for SvelteKit apps deployed to Cloudflare
Workers — SvelteKit 3 + Vite + Zod + plain CSS.

```sh
# needs Node 26 + pnpm 12.8+ — package.json (devEngines) pins both
pnpm install
pnpm dev
```

Four commands are the daily interface: `dev`, `build`, `check`, `test`. Two
more drive deploys: `verify` (check, test, build) and `ship` (upload the build).
`pnpm prose` opens the repo as a document.

The starter's own [docs](docs/README.md) are its demo content — the markdown
files under `docs/`, each with a metadata block validated in
[`src/lib/docs.ts`](src/lib/docs.ts), and served at the same paths, like
`/docs/design.md`. Start with [`design.md`](docs/design.md) to see what's in
the box, then [`setup.md`](docs/setup.md) to make it yours.

Building on this? Start with [`AGENTS.md`](AGENTS.md).
