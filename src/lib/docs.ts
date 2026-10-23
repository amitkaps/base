/** @prose
 * # The docs as pages
 *
 * Each file in `docs/` is a page, rendered with [markz](https://markz.amitkaps.com) at build
 * time. So the site ships no Markdown parser, to the browser or the Worker.
 *
 * Adding a page is adding a file and listing it in the nav. Its slug comes from its name, its
 * place from the nav, and the rest from its metadata. `docs/README.md` is the index, not a page.
 */
import { html, parse, position } from "@amitkaps/markz";
import { z } from "zod";

/** @prose
 * Read eagerly, so every page can be prerendered.
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
 * # The order
 *
 * The docs' order is the `nav` list in `docs/README.md`'s metadata, the one GitHub, prose and
 * craftz's rules read. A doc the nav leaves out fails the build, so no page goes missing from
 * the site's nav.
 */
const nav: string[] = (() => {
  const list = parse(index["/docs/README.md"] ?? "").metadata?.["nav"];
  if (!Array.isArray(list)) throw new Error("docs/README.md: no nav list in its metadata");
  return list.map((name) => String(name).replace(/\.md$/, ""));
})();

/** @prose
 * # Frontmatter schema
 *
 * Add a field here when a page needs one, like a date or an image. A file that doesn't match
 * fails the build, so a bad metadata block never reaches a reader.
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
 * # Rendering a page
 *
 * Any markz warning fails the build. markz keeps Markdown outside its dialect as literal text,
 * so a warning means a page would show what its writer didn't mean. The error names the file,
 * the line and the form to write instead.
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
 * # Links out of the docs
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
 * # The pages
 *
 * Rendered once, when the module loads. Every route is prerendered, so rendering again per
 * request would only repeat the work.
 */
export const docs: Doc[] = Object.entries(files)
  .map(([path, source]) => render(path, source))
  .sort((a, b) => nav.indexOf(a.slug) - nav.indexOf(b.slug));

export const getDoc = (slug: string): Doc | undefined => docs.find((doc) => doc.slug === slug);
