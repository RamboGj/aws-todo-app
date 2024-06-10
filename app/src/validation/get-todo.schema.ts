import * as zod from 'zod';

export const getTodoSchema = zod.object({
  id: zod.string().ulid(),
});
