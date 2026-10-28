/** @prose
 * # Build config
 *
 * One [`vite-plus`](https://vite-plus.dev) config drives dev, build, format, lint and test.
 * `vp <command>` in `package.json` reads whichever section it needs. base follows
 * [craftz's rules](https://craftz.amitkaps.com/docs/rules.md), and `craftz()` sets the format and
 * lint rules every repository shares.
 */
import { defineConfig, lazyPlugins } from "vite-plus";
import { craftz } from "@amitkaps/craftz";

const generated = [".svelte-kit/**", "build/**", "worker-configuration.d.ts"];

export default defineConfig({
  plugins: [
    craftz(),
    // `vp fmt` and `vp lint` read only their own blocks, so they skip this and never import
    // SvelteKit or the adapter, which take about 2s to load.
    lazyPlugins(async () => {
      const [{ sveltekit }, { default: adapter }] = await Promise.all([
        import("@sveltejs/kit/vite"),
        import("@sveltejs/adapter-cloudflare"),
      ]);
      return [
        sveltekit({
          // SvelteKit 3 takes these options flat — not under a `kit` key.
          prerender: {
            // Prerendering follows every internal link, so a strict handler
            // turns the build into a link checker. Add a path here only when
            // something outside this app serves it.
            handleHttpError: ({ path, referrer, message }) => {
              const external: string[] = [];
              if (external.some((prefix) => path === prefix || path.startsWith(`${prefix}/`)))
                return;
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
      ];
    }),
  ],

  // The browsers craftz's rules name.
  build: { target: ["chrome142", "edge142", "firefox153", "safari18.6", "ios18.6"] },

  // Oxfmt — `vp check`. The empty `svelte` block is what turns on .svelte formatting.
  fmt: { svelte: {}, ignorePatterns: generated },

  // Oxlint — `vp check`. It lints .ts and .js; `.svelte` types and a11y come from `svelte-check`,
  // which `pnpm check` runs after it.
  lint: { ignorePatterns: generated },

  // Vitest — `vp test`.
  test: {
    expect: { requireAssertions: true },
  },
});
