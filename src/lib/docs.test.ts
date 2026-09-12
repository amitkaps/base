import { describe, expect, it } from 'vite-plus/test';
import { docs, getDoc } from './docs';

describe('docs', () => {
	it('resolves every doc in the nav', () => {
		expect(docs.length).toBeGreaterThan(0);
		for (const doc of docs) {
			expect(getDoc(doc.slug)).toBe(doc);
		}
	});

	it('derives a title from each file’s H1', () => {
		for (const doc of docs) {
			expect(doc.title).toBeTruthy();
			expect(doc.title).not.toMatch(/^#/);
		}
	});

	it('renders markdown to HTML', () => {
		for (const doc of docs) {
			expect(doc.html).toContain('<h1');
		}
	});

	it('gives every heading a unique id', () => {
		for (const doc of docs) {
			const ids = [...doc.html.matchAll(/<h[1-6] id="([^"]+)"/g)].map((match) => match[1]);
			expect(ids.length).toBeGreaterThan(0);
			expect(new Set(ids).size).toBe(ids.length);
		}
		expect(getDoc('lessons')!.html).toContain('<h2 id="content">');
	});

	it('returns undefined for an unknown slug', () => {
		expect(getDoc('nope')).toBeUndefined();
	});
});
