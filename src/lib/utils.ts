/** Format an ISO date string (`2026-09-01`) as a readable label. */
export function formatDate(iso: string, locale = 'en'): string {
	return new Date(iso).toLocaleDateString(locale, {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}

/** Turn arbitrary text into a URL-safe slug. */
export function slugify(input: string): string {
	return input
		.toLowerCase()
		.trim()
		.replace(/[^\da-z]+/g, '-')
		.replace(/^-+|-+$/g, '');
}
