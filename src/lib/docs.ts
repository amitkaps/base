import { Marked, type RendererObject, type Tokens } from 'marked';
import { z } from 'zod';

// Eager glob: every doc is read and rendered at build time. The pages are
// prerendered, so `marked` never ships to the client or the Worker runtime.
const files = import.meta.glob('/src/content/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
});

// The one place doc order and nav/card copy live. Add a file here + a
// src/content/<slug>.md and it shows up in the nav and on the home page.
const NAV = [
	{ slug: 'stack', summary: 'Every piece in the starter, and why it was chosen.' },
	{ slug: 'setup', summary: 'Make it yours: Cloudflare, secrets, branch protection.' },
	{
		slug: 'upgrade',
		summary: 'Keep a fork current: Dependabot, manual bumps, re-syncing with upstream.'
	},
	{
		slug: 'lessons',
		summary: 'SvelteKit 3 + Vite+ gotchas found building this — for humans and agents.'
	}
] as const;

/** Slugify heading text into an id: lowercase, punctuation dropped, spaces to
 *  hyphens. marked adds no ids of its own, so without this `#section` links
 *  fail silently. */
function headingId(text: string): string {
	const slug = text
		.replace(/<[^>]+>/g, '')
		.replace(/&[a-z]+;|&#\d+;/gi, '')
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-');
	return /^[a-z]/.test(slug) ? slug : `section${slug ? `-${slug}` : ''}`;
}

/** A heading renderer that gives every heading a page-unique id. */
function headingRenderer(): RendererObject {
	const used = new Map<string, number>();
	return {
		heading(this: { parser: { parseInline: (tokens: Tokens.Generic[]) => string } }, token) {
			const { depth, tokens, text } = token as Tokens.Heading;
			const base = headingId(text);
			const count = used.get(base) ?? 0;
			used.set(base, count + 1);
			const id = count === 0 ? base : `${base}-${count}`;
			return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
		}
	};
}

const docSchema = z.object({
	slug: z.string(),
	title: z.string().min(1),
	summary: z.string().min(1),
	html: z.string()
});

export type Doc = z.infer<typeof docSchema>;

// A fresh instance per doc keeps heading-id uniqueness scoped to one page.
// Note `Marked` is a top-level export — `new marked.Marked()` is not a constructor.
function markdown(): Marked {
	const instance = new Marked({ async: false, gfm: true });
	instance.use({ renderer: headingRenderer() });
	return instance;
}

function render({ slug, summary }: (typeof NAV)[number]): Doc {
	const source = files[`/src/content/${slug}.md`] as string | undefined;
	if (!source) throw new Error(`Missing src/content/${slug}.md`);

	const title = /^#\s+(.+)$/m.exec(source)?.[1]?.trim();
	if (!title) throw new Error(`src/content/${slug}.md needs an "# H1" title`);

	return docSchema.parse({
		slug,
		title,
		summary,
		html: markdown().parse(source, { async: false }) as string
	});
}

export const docs: Doc[] = NAV.map(render);

export const getDoc = (slug: string): Doc | undefined => docs.find((doc) => doc.slug === slug);
