import { allPosts } from '#content';
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () =>
	allPosts.filter((post) => !post.draft).map((post) => ({ slug: post.slug }));

export const load: PageLoad = ({ params }) => {
	const post = allPosts.find((entry) => entry.slug === params.slug && !entry.draft);
	if (!post) error(404, 'Post not found');

	return { post };
};
