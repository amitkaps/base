import { load as parseYaml } from 'js-yaml';
import { marked } from 'marked';
import { z } from 'zod';

/**
 * Frontmatter schema — the Zod usage example, and the single source of truth for
 * what a post's metadata looks like. `contactSchema` in `./schemas.ts` follows
 * the same pattern for form payloads.
 */
const frontmatter = z.object({
	title: z.string().min(1),
	description: z.string().min(1),
	// YAML parses unquoted dates into `Date`; normalise to `YYYY-MM-DD`.
	date: z
		.union([z.iso.date(), z.date()])
		.transform((d) => (d instanceof Date ? d.toISOString().slice(0, 10) : d)),
	draft: z.boolean().default(false),
	tags: z.array(z.string()).default([])
});

export type Post = z.infer<typeof frontmatter> & { slug: string; html: string };

const FRONTMATTER = /^---\r?\n(.*?)\r?\n---\r?\n(.*)$/s;

function parse(source: string) {
	const match = FRONTMATTER.exec(source);
	if (!match) return { data: {}, body: source };
	return { data: (parseYaml(match[1]) ?? {}) as unknown, body: match[2] };
}

// Eager glob: every .md file is read and parsed at build time. The blog routes
// are prerendered, so `js-yaml` / `marked` never ship to the client or the
// Worker runtime.
const files = import.meta.glob('/src/content/posts/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
});

export const posts: Post[] = Object.entries(files)
	.map(([path, source]) => {
		const { data, body } = parse(source as string);
		const slug = path.split('/').at(-1)!.replace(/\.md$/, '');
		return {
			...frontmatter.parse(data),
			slug,
			html: marked.parse(body, { async: false })
		};
	})
	.sort((a, b) => b.date.localeCompare(a.date));

/** Posts with `draft: false` — what the blog routes render. */
export const publishedPosts: Post[] = posts.filter((post) => !post.draft);
