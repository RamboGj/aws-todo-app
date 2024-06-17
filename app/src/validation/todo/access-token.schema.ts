import { z } from 'zod';

export const accessTokenSchema = z.object({
  accesstoken: z.string(),
});
