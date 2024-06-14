import { z } from 'zod';

export const confirmSignUpBodySchema = z.object({
  email: z
    .string()
    .includes('@' && '.')
    .min(5, 'Invalid e-mail')
    .max(99, 'E-mail is too long'),
  code: z.string().min(6, 'Code must contain 6-digit').max(6, 'Code must contain 6-digit'),
});
