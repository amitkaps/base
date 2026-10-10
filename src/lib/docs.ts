/** @prose
 * # Content loading
 *
 * Reads every Markdown file under `docs/`, validates its metadata, and renders it to
 * HTML with [markz](https://markz.amitkaps.com) — all at build time, so the rendered site never
 * ships a Markdown parser to the client or the Worker. Each exported [`Doc`](#doc) is one page:
 * adding a page is adding a file and listing it in `docs/README.md`'s `nav`, since the slug
 * comes from the filename, the order from the nav, and everything else from its metadata block.
 * `docs/README.md` is the docs' index, not a page.
 */
import { html, parse, position } from "@amitkaps/markz";
import { z } from "zod";

/** @prose
 * Every `.md` file is read and rendered eagerly (not lazily per-request), so the pages
 * stay prerenderable — `import.meta.glob`'s `eager: true` inlines the raw text at build time.
 */
const files = import.meta.glob(["/docs/*.md", "!/docs/README.md"], {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const index = import.meta.glob("/docs/README.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

/** @prose
 * ## The order
 *
 * The docs' order is the `nav` list in `docs/README.md`'s metadata, the one GitHub, prose and
 * ship's standard read. A doc the nav leaves out fails the build, so no page goes missing from
 * the site's nav.
 */
const nav: string[] = (() => {
  const list = parse(index["/docs/README.md"] ?? "").metadata?.["nav"];
  if (!Array.isArray(list)) throw new Error("docs/README.md: no nav list in its metadata");
  return list.map((name) => String(name).replace(/\.md$/, ""));
})();

/** @prose
 * ## Frontmatter schema
 *
 * Extend this schema as pages need more fields (date, image, tags...). A file that does not
 * match fails the build with its path and the offending key — frontmatter errors are a build
 * failure, not a runtime one.
 */
const frontmatterSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
});

export type Doc = z.infer<typeof frontmatterSchema> & {
  slug: string;
  html: string;
};

/** @prose
 * ## Rendering a page
 *
 * Parses a raw file with markz, validates its metadata block, and renders the body — one
 * function, called once per file at module load. markz never guesses at Markdown outside its
 * dialect: it keeps the text literal and records a warning, and here any warning fails the
 * build, naming the file, line and the form to write instead.
 */
function render(path: string, source: string): Doc {
  const slug = path.slice("/docs/".length, -".md".length);
  if (!nav.includes(slug)) throw new Error(`${path}: not in docs/README.md's nav`);

  const doc = parse(source);
  if (doc.warnings.length > 0) {
    const at = position(source);
    const issues = doc.warnings
      .map((w) => `line ${at(w.start).line}: ${w.message} — write ${w.instead}`)
      .join("; ");
    throw new Error(`${path}: ${issues}`);
  }
  if (!doc.metadata) throw new Error(`${path}: missing metadata block`);

  // A key with nothing after it (`image:`) reads as null, which Zod's
  // .optional() rejects. Treat it as absent.
  const raw = { ...doc.metadata } as Record<string, unknown>;
  for (const [key, value] of Object.entries(raw)) {
    if (value === null || value === "") delete raw[key];
  }

  const parsed = frontmatterSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    throw new Error(`${path}: invalid frontmatter — ${issues}`);
  }

  return { ...parsed.data, slug, html: outward(html(doc)) };
}

/** @prose
 * ## Links out of the docs
 *
 * A doc links to code by its repo path, like `../src/lib/docs.ts`, which works on GitHub. The
 * site serves only the docs, so such a link goes to the file on GitHub instead. A link to
 * another doc stays as it is, since the doc is served at its own path.
 */
const REPO = "https://github.com/amitkaps/base/blob/main/";

const outward = (body: string): string =>
  body.replace(/href="\.\.\/([^"]*)"/g, (_, path: string) => `href="${REPO}${path}"`);

/** Render a markdown body to HTML; heading ids are unique per call. */
export const renderMarkdown = (body: string): string => html(body);

/** @prose
 * ## Public exports
 *
 * `docs` is every page, rendered and sorted once at module load — routes read from this array
 * instead of re-rendering per request, since every route here is prerendered anyway. `getDoc`
 * looks a single page up by slug for the `docs/[slug].md` route.
 */
export const docs: Doc[] = Object.entries(files)
  .map(([path, source]) => render(path, source))
  .sort((a, b) => nav.indexOf(a.slug) - nav.indexOf(b.slug));

export const getDoc = (slug: string): Doc | undefined => docs.find((doc) => doc.slug === slug);
