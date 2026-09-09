import { publishedPosts } from '#lib';
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () => publishedPosts.map((post) => ({ slug: post.slug }));

export const load: PageLoad = ({ params }) => {
	const post = publishedPosts.find((entry) => entry.slug === params.slug);
	if (!post) error(404, 'Post not found');

	return { post };
};
