import { defineCollection, defineConfig } from '@content-collections/core';
import { compileMarkdown } from '@content-collections/markdown';
import { z } from 'zod';

/**
 * Frontmatter schema, authored with Zod so the same validation style is reused
 * across the app (see `src/lib/schemas.ts`). Content Collections accepts any
 * Standard Schema, so a plain `z.object(...)` works directly.
 */
const postFrontmatter = z.object({
	title: z.string().min(1),
	description: z.string().min(1),
	date: z.iso.date(),
	draft: z.boolean().default(false),
	tags: z.array(z.string()).default([]),
	content: z.string()
});

const posts = defineCollection({
	name: 'posts',
	directory: 'src/content/posts',
	include: '**/*.md',
	schema: postFrontmatter,
	transform: async (doc, ctx) => ({
		...doc,
		slug: doc._meta.path,
		html: await compileMarkdown(ctx, doc)
	})
});

export default defineConfig({
	content: [posts]
});
