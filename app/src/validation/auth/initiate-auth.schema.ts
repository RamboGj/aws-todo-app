import { z } from 'zod';

export const initiateAuthSchema = z.object({
  email: z
    .string()
    .includes('@' && '.')
    .min(5, 'Invalid e-mail')
    .max(99, 'E-mail is too long'),
  tempPassword: z.string().min(8, 'Temp password is invalid'),
});
