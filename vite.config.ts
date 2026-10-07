/** @prose
 * # Build config
 *
 * One Vite config drives dev, build and test: SvelteKit's options and Vitest's.
 * Formatting and linting run outside Vite, as `oxfmt` and `oxlint` in `package.json`.
 * Why not Vite+: see `src/content/lessons.md`.
 */
import { defineConfig } from "vitest/config";
import adapter from "@sveltejs/adapter-cloudflare";
import { sveltekit } from "@sveltejs/kit/vite";

export default defineConfig({
  plugins: [
    sveltekit({
      // SvelteKit 3 takes these options flat — not under a `kit` key.
      prerender: {
        // Prerendering follows every internal link, so a strict handler
        // turns the build into a link checker. Add a path here only when
        // something outside this app serves it.
        handleHttpError: ({ path, referrer, message }) => {
          const external: string[] = [];
          if (external.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) return;
          throw new Error(`${message} (linked from ${referrer})`);
        },
      },
      compilerOptions: {
        // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
        runes: ({ filename }) =>
          filename.split(/[/\\]/).includes("node_modules") ? undefined : true,
      },
      adapter: adapter(),
    }),
  ],

  // Vitest — `pnpm test`.
  test: {
    expect: { requireAssertions: true },
  },
});
