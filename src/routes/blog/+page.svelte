<script lang="ts">
	import { formatDate } from '#lib';

	let { data } = $props();
</script>

<h1>Blog</h1>

<ul class="posts">
	{#each data.posts as post (post.slug)}
		<li>
			<a href="/blog/{post.slug}">{post.title}</a>
			<p class="meta">{formatDate(post.date)} · {post.tags.join(', ')}</p>
			<p>{post.description}</p>
		</li>
	{/each}
</ul>

<style>
	.posts {
		list-style: none;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.posts a {
		font-size: 1.1rem;
		font-weight: 600;
	}

	.meta {
		margin: 0.25rem 0;
		color: var(--text-muted);
		font-size: 0.85rem;
	}
</style>
