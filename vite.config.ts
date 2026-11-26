/** @prose
 * # Build config
 *
 * One [`vite-plus`](https://vite-plus.dev) config drives dev, build, format, lint and test.
 * `vp <command>` in `package.json` reads whichever section it needs. base follows
 * [craftz's rules](https://craftz.amitkaps.com/docs/rules.md), and the `fmt` and `lint` blocks are
 * written out as they say, the same in every repository.
 */
import { defineConfig, lazyPlugins } from "vite-plus";

const generated = [".svelte-kit/**", "build/**", "worker-configuration.d.ts"];

export default defineConfig({
  plugins: [
    // `vp fmt` and `vp lint` read only their own blocks, so they skip this and never import
    // SvelteKit or the adapter, which take about 2s to load.
    lazyPlugins(async () => {
      const [{ sveltekit }, { default: adapter }] = await Promise.all([
        import("@sveltejs/kit/vite"),
        import("@sveltejs/adapter-cloudflare"),
      ]);
      return [
        sveltekit({
          // oxlint-disable-next-line typescript/no-deprecated -- the one way to give every task the same tsconfig
          typescript: {
            config: (config: Record<string, object>) => ({
              ...config,
              compilerOptions: {
                ...config["compilerOptions"],
                rootDirs: ["../..", "../../.svelte-kit/types"],
              },
            }),
          },
          // `build` and `preview` keep their generated files apart from `check`'s, so the two can
          // run side by side ([craftz's rule](https://craftz.amitkaps.com/docs/rules.md#scripts-sveltekit)).
          outDir: process.env.SVELTEKIT_OUT_DIR ?? ".svelte-kit",
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
  build: { target: ["chrome149", "edge149", "firefox153", "safari18.6", "ios18.6"] },

  // Oxfmt — `vp check`. The empty `svelte` block is what turns on .svelte formatting.
  fmt: { svelte: {}, ignorePatterns: generated, proseWrap: "never" },

  // Oxlint — `vp check`. It lints .ts and .js; `.svelte` types and a11y come from `svelte-check`,
  // which `pnpm check` runs after it.
  lint: {
    ignorePatterns: generated,
    plugins: ["typescript", "unicorn", "import"],
    categories: { correctness: "error" },
    options: { typeAware: true, typeCheck: true },
    // Beyond correctness, rules that caught real code in a trial across craftz, prose, markz and a
    // private application: dead conditions and casts, leftover empty imports, and promises
    // nobody awaits. The rules after `restrict-template-expressions` went on once no file broke
    // them: a thrown string, an unbound method, a `+` on an object, or an `any` returned or passed on.
    // The promise rules read `.ts` files, since type-aware rules don't run in a `.svelte` script.
    rules: {
      "no-empty": "error",
      "no-case-declarations": "error",
      "import/no-empty-named-blocks": "error",
      "typescript/no-unnecessary-type-assertion": "error",
      "typescript/no-unnecessary-condition": "error",
      "typescript/no-floating-promises": "error",
      "typescript/no-misused-promises": "error",
      "typescript/await-thenable": "error",
      "typescript/no-base-to-string": "error",
      "typescript/no-deprecated": "error",
      "typescript/require-array-sort-compare": "error",
      "typescript/restrict-template-expressions": "error",
      "typescript/no-unsafe-enum-comparison": "error",
      "typescript/only-throw-error": "error",
      "typescript/no-redundant-type-constituents": "error",
      "typescript/restrict-plus-operands": "error",
      "typescript/unbound-method": "error",
      "typescript/prefer-promise-reject-errors": "error",
      "typescript/no-unsafe-function-type": "error",
      "typescript/no-misused-spread": "error",
      "typescript/no-explicit-any": "error",
      "typescript/no-unsafe-return": "error",
      "typescript/no-unsafe-argument": "error",
      "typescript/use-unknown-in-catch-callback-variable": "error",
    },
  },

  // Vitest — `vp test`.
  test: {
    expect: { requireAssertions: true },
    exclude: ["**/node_modules/**", "**/.git/**", ".claude/worktrees/**"],
  },

  run: {
    cache: { scripts: false, tasks: true },
    tasks: {
      all: { command: "true", dependsOn: ["check", "tested", "built"], cache: false },
      tested: {
        command: "pnpm run test",
        cache: { input: [{ auto: true }, "!dist/**", "!.svelte-kit/**", "!node_modules/$app/**"] },
      },
      built: {
        command: "pnpm run build",
        cache: { input: [{ auto: true }, "!.svelte-kit/**", "!node_modules/$app/**"] },
      },
    },
  },
});
