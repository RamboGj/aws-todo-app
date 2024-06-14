import { z } from 'zod';

export const signUpBodySchema = z
  .object({
    email: z
      .string()
      .includes('@' && '.')
      .min(5, 'Invalid e-mail')
      .max(99, 'E-mail is too long'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(99, 'Password is too long')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(99, 'Password is too long')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must be equal.',
  });
