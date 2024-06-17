import { z } from 'zod';

export const postTodoBodySchema = z.object({
  title: z.string().min(1, 'TODO title is expected to be larger.').max(99, 'TODO title is too large.'),
  description: z
    .string()
    .min(1, 'TODO description is expected to be larger')
    .max(999, 'TODO description is too large.'),
  isDone: z.boolean(),
});
