import { describe, expect, it } from 'vitest';
import { allPosts } from '#content';

describe('content collections', () => {
	it('loads and validates the sample posts', () => {
		expect(allPosts.length).toBeGreaterThanOrEqual(2);
		for (const post of allPosts) {
			expect(post.title).toBeTruthy();
			expect(post.slug).toBeTruthy();
			expect(typeof post.draft).toBe('boolean');
		}
	});

	it('has exactly one published (non-draft) post', () => {
		expect(allPosts.filter((p) => !p.draft)).toHaveLength(1);
	});
});
