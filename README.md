# base

An opinionated, kept-current starter for SvelteKit apps deployed to Cloudflare
Workers — SvelteKit 3 + Vite+ + Zod + plain CSS.

```sh
# needs Node 24 + pnpm 12 (mise / nvm / corepack — see package.json)
pnpm install
pnpm dev
```

Five commands are the whole interface: `dev`, `build`, `check`, `test`, `deploy`.

The starter's own docs are its demo content — the markdown files under
`src/content/`, listed in the `NAV` array in
[`src/lib/docs.ts`](src/lib/docs.ts) and served at `/stack`, `/setup`,
`/upgrade` and `/lessons`. Start with
[`stack.md`](src/content/stack.md) to see what's in the box, then
[`setup.md`](src/content/setup.md) to make it yours.

Building on this? Start with [`AGENTS.md`](AGENTS.md).
