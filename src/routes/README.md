# routes

[`+layout.svelte`](+layout.svelte) is the shell every route renders inside. [`+page.svelte`](+page.svelte)
is the home page, listing every doc; [`docs/[slug].md/+page.svelte`](docs/%5Bslug%5D.md/+page.svelte) renders one
doc at `/docs/<file>.md`, with its slugs enumerated for prerendering in [`docs/[slug].md/+page.ts`](docs/%5Bslug%5D.md/+page.ts).
[`+layout.ts`](+layout.ts) turns on static prerendering and off client-side JS for the whole tree.
