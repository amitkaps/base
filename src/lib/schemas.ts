import { z } from 'zod';

/**
 * Example Zod schema + inferred type. Use this pattern for form payloads,
 * API responses, and `load` inputs so validation lives in one place.
 */
export const contactSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.email('Enter a valid email'),
	message: z.string().min(10, 'Message must be at least 10 characters')
});

export type Contact = z.infer<typeof contactSchema>;
