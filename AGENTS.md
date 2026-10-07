# Working on this repo

Read **`src/content/lessons.md`** first — it covers SvelteKit 3, the Oxc
tools, pnpm 12 and Cloudflare quirks this project already worked through.

- Before committing: `pnpm check` (format, lint, typecheck, Svelte diagnostics)
  and `pnpm test` must pass. After a dependency bump, `pnpm build` too.
- The toolchain (`vite`, `vitest`, `oxlint`, `oxfmt`) is dev dependencies — run
  it through the `pnpm run …` scripts, not a global install.
- The files in `src/content/` are the site's pages _and_ its docs. Update the
  doc, not a separate copy. Each fact lives in exactly one of them: `stack.md`
  (what's here), `setup.md` (one-time setup), `upgrade.md` (keeping current),
  `lessons.md` (gotchas).

## Prose (`@amitkaps/prose`, `pnpm prose`)

- Every file has file prose, and every meaningful unit of it is in a chunk with prose. Trivial declarations, types, constants and mechanical helpers don't need a chunk of their own unless they carry architectural intent; a paragraph written only to satisfy this rule is noise the human has to read. Folders have a `README.md`, except `.github/`, where GitHub would show it in place of the root's.
- Every prose block, file, folder and doc begins with a short first paragraph that is its summary for the human: about three lines, one idea per sentence. It says what the node means, not what its code does; detail goes in the chunks below. When a change alters a node's role, rewrite that paragraph in the same change.
- Prose goes in `@prose` comments, in markz's Markdown. Ordinary comments stay for code-level notes.
- Prose says what the code can't: why it exists, what it promises, what was decided and what was ruled out. It doesn't retell what reading the code shows, and it doesn't replace ordinary comments.
- Keep prose current in the same change as the code. Rewrite it where it has drifted; don't append. A change that only tunes code (same behaviour, same stated costs) needn't touch prose.
- State a rule once. If a doc or a tested file owns it, link to it by repo path and keep only how and why this code does it.
- Decisions made in the chat go into the prose in the same change: into the doc they change when they span files, into the `@prose` block when they concern one spot. Write docs for a reader who wasn't in the chat, since they may be published as they are. Keep the promises doc short, and update its non-goals when something is ruled out.
- Keep the plan current: what's done in one line each, what's next in order. Work that belongs to one file can be a pending chunk there instead.
- To find your way: `grep -rn -A4 "@prose" src` is the map; `grep -rL "@prose" src --include="*.ts"` lists files with no prose yet.

Run `pnpm prose` to read the repo as a document (read-only; opens the browser).
