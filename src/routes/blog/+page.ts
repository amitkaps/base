import { publishedPosts } from '#lib';
import type { PageLoad } from './$types';

export const prerender = true;

export const load: PageLoad = () => ({
	posts: publishedPosts.map(({ slug, title, description, date, tags }) => ({
		slug,
		title,
		description,
		date,
		tags
	}))
});
