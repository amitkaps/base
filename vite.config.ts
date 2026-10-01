/** @prose
 * # Build config
 *
 * One [`vite-plus`](https://vite-plus.dev) config drives dev, build, format, lint and test —
 * `vp <script>` in `package.json` reads whichever of the sections below its command needs.
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

  // Oxfmt's defaults — `vp fmt` / `vp check`. Only what to skip is set; the
  // empty `svelte` block is what turns on .svelte formatting.
  fmt: {
    svelte: {},
    ignorePatterns: [...generated, "pnpm-lock.yaml"],
  },

  // Oxlint — `vp lint` / `vp check`. Lints .ts/.js only; `.svelte` type + a11y
  // diagnostics come from `svelte-check`, run by `pnpm check`.
  lint: {
    plugins: ["typescript", "unicorn", "import"],
    categories: { correctness: "error" },
    options: { typeAware: true, typeCheck: true },
    ignorePatterns: generated,
  },

  // Vitest — `vp test`.
  test: {
    expect: { requireAssertions: true },
    environment: "node",
    include: ["src/**/*.{test,spec}.{js,ts}"],
  },
});
