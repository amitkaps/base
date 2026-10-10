/** @prose
 * # Build config
 *
 * One [`vite-plus`](https://vite-plus.dev) config drives dev, build, format, lint and test.
 * `vp <command>` in `package.json` reads whichever section it needs. base follows the standard at
 * [ship](https://ship.amitkaps.com), so its toolchain is the one every repository shares.
 */
import { defineConfig } from "vite-plus";
import adapter from "@sveltejs/adapter-cloudflare";
import { sveltekit } from "@sveltejs/kit/vite";

const generated = [".svelte-kit/**", "build/**", "worker-configuration.d.ts"];

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

  // Oxfmt's defaults — `vp fmt` / `vp check`. The empty `svelte` block is what turns on
  // .svelte formatting.
  fmt: {
    svelte: {},
    ignorePatterns: generated,
  },

  // Oxlint — `vp lint` / `vp check`. It lints .ts and .js; `.svelte` types and a11y come
  // from `svelte-check`, which `pnpm check` runs after it.
  lint: {
    plugins: ["typescript", "unicorn", "import"],
    categories: { correctness: "error" },
    options: { typeAware: true, typeCheck: true },
    ignorePatterns: generated,
  },

  // Vitest — `vp test`.
  test: {
    expect: { requireAssertions: true },
  },
});
