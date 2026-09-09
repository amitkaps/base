import { marked } from 'marked';
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
		slug: 'lessons',
		summary: 'SvelteKit 3 + Vite+ gotchas found building this — for humans and agents.'
	}
] as const;

const docSchema = z.object({
	slug: z.string(),
	title: z.string().min(1),
	summary: z.string().min(1),
	html: z.string()
});

export type Doc = z.infer<typeof docSchema>;

function render({ slug, summary }: (typeof NAV)[number]): Doc {
	const source = files[`/src/content/${slug}.md`] as string | undefined;
	if (!source) throw new Error(`Missing src/content/${slug}.md`);

	const title = /^#\s+(.+)$/m.exec(source)?.[1]?.trim();
	if (!title) throw new Error(`src/content/${slug}.md needs an "# H1" title`);

	return docSchema.parse({
		slug,
		title,
		summary,
		html: marked.parse(source, { async: false, gfm: true })
	});
}

export const docs: Doc[] = NAV.map(render);

export const getDoc = (slug: string): Doc | undefined => docs.find((doc) => doc.slug === slug);
