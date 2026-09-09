---
title: Hello World
description: The first post in this starter, showing how Content Collections works.
date: 2026-09-01
tags:
  - meta
  - sveltekit
---

# Hello World

This markdown file is loaded at build time by `src/lib/posts.ts` — a ~25-line
`import.meta.glob` that reads every `.md`, parses frontmatter with `gray-matter`,
validates it against a Zod schema, and renders the body with `marked`.

```ts
import { publishedPosts } from '#lib';
```

`publishedPosts` is fully typed and drafts are filtered out.
