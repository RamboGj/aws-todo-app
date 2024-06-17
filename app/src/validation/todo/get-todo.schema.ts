import { z } from 'zod';

export const getTodoSchema = z.object({
  id: z
    .string()
    .ulid()
    .transform((val) => {
      return `Todos#${val}`;
    }),
});
