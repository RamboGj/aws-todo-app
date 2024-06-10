import { z } from 'zod';

export const putTodoBodySchema = z.object({
  title: z.string().min(1, 'TODO title is expected to be larger.').max(99, 'TODO title is too large.').optional(),
  description: z
    .string()
    .min(1, 'TODO description is expected to be larger')
    .max(999, 'TODO description is too large.')
    .optional(),
  isDone: z.boolean().optional(),
});

export const putTodoPathSchema = z.object({
  id: z
    .string()
    .ulid()
    .transform((val) => {
      return `Todos#${val}`;
    }),
});
