import { describe, expect, it } from 'vitest';
import { contactSchema } from './schemas';
import { formatDate, slugify } from './utils';

describe('formatDate', () => {
	it('formats an ISO date', () => {
		expect(formatDate('2026-09-01', 'en-US')).toBe('September 1, 2026');
	});
});

describe('slugify', () => {
	it('lowercases and dashes', () => {
		expect(slugify('  Hello, World!  ')).toBe('hello-world');
	});
});

describe('contactSchema', () => {
	it('accepts a valid payload', () => {
		const result = contactSchema.safeParse({
			name: 'Ada',
			email: 'ada@example.com',
			message: 'This is long enough.'
		});
		expect(result.success).toBe(true);
	});

	it('rejects a bad email', () => {
		const result = contactSchema.safeParse({
			name: 'Ada',
			email: 'nope',
			message: 'This is long enough.'
		});
		expect(result.success).toBe(false);
	});
});
