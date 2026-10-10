---
title: Development
summary: "How base itself is built, checked and deployed."
---

How base is built and changed. What every repository shares, like the scripts, CI and
deploys, is in [ship's standard](https://ship.amitkaps.com/docs/standard.md), and isn't
repeated here.

## Build and check

```sh
pnpm install
pnpm dev
pnpm verify    # what CI and every deploy run
```

`check` runs more than `vp check`. `svelte-kit sync` and `wrangler types` generate the
types SvelteKit and the Worker need first, and `svelte-check` checks the `.svelte` files
after, since oxlint doesn't type-check them.

## The docs pages

The docs in `docs/` are the site's pages. [src/lib/docs.ts](../src/lib/docs.ts) reads
them with markz at build time, checks each one's metadata, and orders them by
`docs/README.md`'s `nav`. A page is served at `/docs/<file>.md`, the same address as the
file, so a link works on GitHub and on the site.

## The site

[base.amitkaps.com](https://base.amitkaps.com) is the Worker `base`, built from `main` by
Cloudflare's Git integration with the settings in ship's standard. `ship` runs
`wrangler deploy`, since cf can't deploy SvelteKit yet ([lessons](lessons.md#cloudflare)).

The docs used to be served at `/stack`, `/setup`, `/upgrade` and `/lessons`. [\_redirects](../_redirects) sends those addresses to the docs' paths, and the Cloudflare adapter reads it from the project root.
