import { describe, expect, it } from 'vite-plus/test';
import { posts, publishedPosts } from './posts';

describe('posts', () => {
	it('loads and validates the sample markdown', () => {
		expect(posts.length).toBeGreaterThanOrEqual(2);
		for (const post of posts) {
			expect(post.title).toBeTruthy();
			expect(post.slug).toBeTruthy();
			expect(post.html).toContain('<');
		}
	});

	it('sorts newest first', () => {
		const dates = posts.map((p) => p.date);
		expect([...dates].sort((a, b) => b.localeCompare(a))).toEqual(dates);
	});

	it('excludes drafts from publishedPosts', () => {
		expect(publishedPosts.every((p) => !p.draft)).toBe(true);
		expect(publishedPosts.length).toBeLessThan(posts.length);
	});
});
