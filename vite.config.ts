import { defineConfig } from 'vite-plus';
import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import contentCollections from '@content-collections/vite';

const generated = [
	'.svelte-kit/**',
	'build/**',
	'.content-collections/**',
	'worker-configuration.d.ts'
];

// In Vitest we skip both plugins: the SvelteKit plugin installs a dev-server
// hook incompatible with the Vitest environment, and the Content Collections
// watcher keeps the process alive. Tests cover pure modules and `#content` /
// `#lib` (resolved via package.json "imports" against files `pnpm sync` builds).
const inTest = !!process.env.VITEST;

export default defineConfig({
	plugins: inTest
		? []
		: [
				contentCollections(),
				sveltekit({
					compilerOptions: {
						// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
						runes: ({ filename }) =>
							filename.split(/[/\\]/).includes('node_modules') ? undefined : true
					},
					adapter: adapter()
				})
			],

	// Oxfmt config for `vp fmt` / `vp check`.
	fmt: {
		useTabs: true,
		singleQuote: true,
		semi: true,
		printWidth: 100,
		trailingComma: 'none',
		svelte: { indentScriptAndStyle: true },
		sortPackageJson: true,
		ignorePatterns: [...generated, 'pnpm-lock.yaml', 'CHANGELOG.md']
	},

	// Oxlint config for `vp lint` / `vp check`. Lints .ts/.js only —
	// `.svelte` type + a11y diagnostics come from `pnpm check:svelte`.
	lint: {
		plugins: ['typescript', 'unicorn', 'import'],
		categories: {
			correctness: 'error'
		},
		options: {
			typeAware: true,
			typeCheck: true
		},
		ignorePatterns: generated,
		rules: {
			// Content Collections exposes frontmatter metadata as `_meta`.
			'no-underscore-dangle': 'off'
		}
	},

	test: {
		expect: { requireAssertions: true },
		environment: 'node',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
	}
});
