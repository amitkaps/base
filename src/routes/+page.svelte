<script lang="ts">
	import Dialog from '#lib/components/Dialog.svelte';
	import Accordion from '#lib/components/Accordion.svelte';

	const stack = [
		{ value: 'kit', title: 'SvelteKit 3 + Vite', content: 'App framework and build tooling.' },
		{
			value: 'viteplus',
			title: 'Vite+ (oxlint · oxfmt · vitest · tsc)',
			content: 'One `vp check` runs format, lint, and type checks.'
		},
		{ value: 'zod', title: 'Zod', content: 'Schema validation, reused by Content Collections.' },
		{
			value: 'cc',
			title: 'Content Collections',
			content: 'Type-safe markdown, imported from `content-collections`.'
		},
		{
			value: 'bits',
			title: 'Bits UI',
			content: 'Headless components, styled here with plain CSS.'
		},
		{ value: 'cf', title: 'Cloudflare adapter', content: 'Deploys to Workers via GitHub Actions.' }
	];
</script>

<h1>SvelteKit Starter</h1>
<p>An opinionated starting point. Everything below is wired and tested.</p>

<Dialog title="It works" description="This dialog is a Bits UI primitive with plain-CSS styling.">
	{#snippet trigger()}Open a Bits UI dialog{/snippet}
	<p>Swap the tokens in <code>src/app.css</code> to rebrand.</p>
</Dialog>

<h2>What's in the box</h2>
<Accordion items={stack} />
