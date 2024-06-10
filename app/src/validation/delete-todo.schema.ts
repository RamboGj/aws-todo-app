import * as zod from 'zod';

export const deleteTodoSchema = zod.object({
  id: zod.string().ulid(),
});
