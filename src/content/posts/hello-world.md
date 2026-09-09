---
title: Hello World
description: The first post in this starter, showing how Content Collections works.
date: 2026-09-01
tags:
  - meta
  - sveltekit
---

# Hello World

This markdown file is parsed and validated at build time by **Content Collections**
using the Zod schema in `content-collections.ts`. Import it anywhere with:

```ts
import { allPosts } from '#content';
```

Everything is fully typed — `title`, `date`, `tags`, and the compiled `content`.
