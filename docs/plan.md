---
title: Plan
summary: "Where base is, and what's next."
---

Where the starter is and what comes next. Finished work gets a line or two. The detail is in
the other docs and `git log`.

## Where it is

base is a SvelteKit 3 starter on Vite+, deployed to a Cloudflare Worker with wrangler, and it
follows [ship's standard](https://ship.amitkaps.com/docs/standard.md). Its docs are its demo
content, rendered by markz at build time.

### The docs as the standard has them

The docs moved from `src/content/` to `docs/`, with a plan and a development doc, and the
site serves them at `/docs/<file>.md`. Their order is `docs/README.md`'s `nav`.

### Back on the standard

base left Vite+ for the standalone tools, then moved back, with `wrangler.toml` and the
standard's scripts. Deploys come from Cloudflare's Git integration.

### markz

markz replaced `marked`, `yaml` and the glue that joined them.

### The starter

SvelteKit with Vite+ on Cloudflare, static by default, with strict links and Unicode
heading ids.

## Next, in order

1. TypeScript 7, when svelte-check accepts it.
2. cf in place of wrangler, when SvelteKit's adapter writes cf's Build Output.

## Later

## Open questions
