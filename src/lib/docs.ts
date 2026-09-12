import { load as parseYaml } from 'js-yaml';
import { Marked, type RendererObject, type Tokens } from 'marked';
import { z } from 'zod';

// Eager glob: every doc is read and rendered at build time. The pages are
// prerendered, so `marked` and `js-yaml` never ship to the client or the Worker.
// Adding a page is adding a file: the slug is the filename, and everything else
// comes from its frontmatter.
const files = import.meta.glob('/src/content/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

// Extend this schema as pages need more fields (date, image, tags...). A file
// that does not match fails the build with its path and the offending key.
const frontmatterSchema = z.object({
	title: z.string().min(1),
	summary: z.string().min(1),
	/** Position in the nav and on the home page, ascending. */
	order: z.number().int()
});

export type Doc = z.infer<typeof frontmatterSchema> & {
	slug: string;
	html: string;
};

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

// A fresh instance per doc keeps heading-id uniqueness scoped to one page.
// Note `Marked` is a top-level export — `new marked.Marked()` is not a constructor.
function markdown(): Marked {
	const instance = new Marked({ async: false, gfm: true });
	instance.use({ renderer: headingRenderer() });
	return instance;
}

function render(path: string, source: string): Doc {
	const slug = path.slice('/src/content/'.length, -'.md'.length);

	const match = FRONTMATTER.exec(source);
	if (!match) throw new Error(`${path}: missing YAML frontmatter`);

	// A key with nothing after it (`image:`) parses to null, which Zod's
	// .optional() rejects. Treat it as absent.
	const raw = (parseYaml(match[1]) ?? {}) as Record<string, unknown>;
	for (const [key, value] of Object.entries(raw)) {
		if (value === null || value === '') delete raw[key];
	}

	const parsed = frontmatterSchema.safeParse(raw);
	if (!parsed.success) {
		const issues = parsed.error.issues
			.map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
			.join('; ');
		throw new Error(`${path}: invalid frontmatter — ${issues}`);
	}

	const body = source.slice(match[0].length);
	return { ...parsed.data, slug, html: markdown().parse(body, { async: false }) as string };
}

export const docs: Doc[] = Object.entries(files)
	.map(([path, source]) => render(path, source))
	.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));

export const getDoc = (slug: string): Doc | undefined => docs.find((doc) => doc.slug === slug);
