<script lang="ts">
	import { docs } from '#lib';
	import Dialog from '#lib/components/Dialog.svelte';
	import Accordion from '#lib/components/Accordion.svelte';

	const inside = [
		{
			value: 'kit',
			title: 'SvelteKit 3 + Svelte 5',
			content: 'App framework, runes, prerendered.'
		},
		{
			value: 'vp',
			title: 'Vite+',
			content: 'One `vp check` = format + lint + typecheck. Vite, Vitest, Oxc bundled.'
		},
		{
			value: 'content',
			title: 'Markdown + Zod',
			content: 'import.meta.glob + marked. These three pages are the demo.'
		},
		{ value: 'cf', title: 'Cloudflare adapter', content: 'Deploys to Workers from GitHub Actions.' }
	];
</script>

<h1>SvelteKit Starter</h1>
<p>An opinionated, kept-current base for SvelteKit on Cloudflare. Start here:</p>

<div class="cards">
	{#each docs as doc (doc.slug)}
		<a class="card" href="/{doc.slug}">
			<strong>{doc.title}</strong>
			<span>{doc.summary}</span>
		</a>
	{/each}
</div>

<hr />

<h2>UI primitives</h2>
<p>Bits UI (headless) styled with plain CSS — see <code>src/lib/components/</code>.</p>

<Dialog title="It works" description="A Bits UI dialog, styled with the tokens in src/app.css.">
	{#snippet trigger()}Open a dialog{/snippet}
	<p>Swap the tokens in <code>src/app.css</code> to rebrand the whole site.</p>
</Dialog>

<h3>What's inside</h3>
<Accordion items={inside} />

<style>
	.cards {
		display: grid;
		gap: 0.75rem;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		margin: 1.5rem 0;
	}

	.card {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 1rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		text-decoration: none;
		color: var(--text);
	}

	.card:hover {
		background: var(--surface-hover);
	}

	.card span {
		color: var(--text-muted);
		font-size: 0.9rem;
	}

	hr {
		margin: 2.5rem 0;
		border: 0;
		border-top: 1px solid var(--border);
	}
</style>
