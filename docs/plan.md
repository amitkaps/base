---
title: Plan
summary: "What's next for base, in order, and what works now."
---

base is a SvelteKit 3 starter on Vite+, deployed to a Cloudflare Worker with wrangler, and it follows [craftz's rules](https://craftz.amitkaps.com/docs/rules.md). Its docs are its demo content, rendered by markz at build time. This plan says what's next, in order, and what works now.

## Next, in order

1. **TypeScript 7**, when svelte-check accepts it. craftz holds `versions-typescript` until then.
2. **cf in place of wrangler**, when SvelteKit's adapter writes cf's Build Output. craftz holds `cloudflare-config` until then.

## Where it is

- **The starter.** SvelteKit with Vite+ on Cloudflare, static by default, with strict links and Unicode heading ids.
- **The docs.** They live in `docs/`, in the order of `docs/README.md`'s `nav`, and the site serves them at `/docs/<file>.md`.
- **markz.** It replaced `marked`, `yaml` and the glue that joined them.
- **craftz.** base runs the shared scripts with `wrangler.toml`, and Cloudflare's Git integration deploys it. It left Vite+ for the standalone tools once, and came back ([lessons](lessons.md#toolchain)).

## Later

## Open questions
