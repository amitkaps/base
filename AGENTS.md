# Working on this repo

Read **`src/content/lessons.md`** first — it covers the SvelteKit 3 RC, Vite+,
pnpm 12 and Cloudflare quirks this project already worked through.

- Before committing: `pnpm check` (format + lint + typecheck), `pnpm check:svelte`,
  and `pnpm test` must pass.
- `vp` is a dev dependency — run it through the `pnpm run …` scripts, not a
  global install.
- The three files in `src/content/` are the site's pages _and_ its docs. Update
  the doc, not a separate copy.
