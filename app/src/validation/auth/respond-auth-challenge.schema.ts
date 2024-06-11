import { z } from 'zod';

export const respondToAuthChallengeBodySchema = z.object({
  email: z
    .string()
    .includes('@' && '.')
    .min(5, 'Invalid e-mail')
    .max(99, 'E-mail is too long'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(99, 'Password is too long')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
});

export const respondToAuthChallengeHeadersSchema = z.object({
  session: z.string(),
});
