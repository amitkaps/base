import { allPosts } from '#content';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = () => {
	const posts = allPosts
		.filter((post) => !post.draft)
		.sort((a, b) => b.date.localeCompare(a.date))
		.map(({ slug, title, description, date, tags }) => ({ slug, title, description, date, tags }));

	return { posts };
};
