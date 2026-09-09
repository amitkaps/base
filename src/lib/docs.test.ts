import { describe, expect, it } from 'vite-plus/test';
import { docs, getDoc } from './docs';

describe('docs', () => {
	it('loads the content files in nav order', () => {
		expect(docs.map((d) => d.slug)).toEqual(['stack', 'setup', 'upgrade', 'lessons']);
	});

	it('derives the title from each file’s H1', () => {
		for (const doc of docs) {
			expect(doc.title).toBeTruthy();
			expect(doc.title).not.toMatch(/^#/);
		}
	});

	it('renders markdown to HTML', () => {
		expect(getDoc('stack')?.html).toContain('<h1');
	});

	it('returns undefined for an unknown slug', () => {
		expect(getDoc('nope')).toBeUndefined();
	});
});
