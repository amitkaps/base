<script lang="ts">
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="shell">
	<header>
		<a href="/" class="brand">SvelteKit Starter</a>
		<nav>
			<a href="/">Home</a>
			<a href="/blog">Blog</a>
		</nav>
	</header>

	<main>
		{@render children()}
	</main>

	<footer>Built with SvelteKit · Vite+ · Cloudflare</footer>
</div>

<style>
	.shell {
		max-width: 42rem;
		margin: 0 auto;
		padding: 1.5rem;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--border);
	}

	.brand {
		font-weight: 700;
		text-decoration: none;
		color: var(--text);
	}

	nav {
		display: flex;
		gap: 1rem;
	}

	main {
		flex: 1;
		padding: 2rem 0;
	}

	footer {
		padding-top: 1.5rem;
		border-top: 1px solid var(--border);
		color: var(--text-muted);
		font-size: 0.85rem;
	}
</style>
