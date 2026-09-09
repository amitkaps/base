<script lang="ts">
	import { formatDate } from '#lib';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.post.title}</title>
	<meta name="description" content={data.post.description} />
</svelte:head>

<article>
	<a href="/blog">← Back to blog</a>
	<h1>{data.post.title}</h1>
	<p class="meta">{formatDate(data.post.date)}</p>
	<!-- html is produced at build time from trusted local markdown (src/lib/posts.ts) -->
	{@html data.post.html}
</article>

<style>
	.meta {
		color: var(--text-muted);
		font-size: 0.85rem;
	}
</style>
