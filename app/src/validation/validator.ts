import { fromZodError } from 'zod-validation-error';
import { z } from 'zod';
import { ValidationError } from './validation.error';

export const validate = <T extends z.ZodType<any, any>>(schema: T, body: unknown) => {
  const response = schema.safeParse(body);

  if (!response.success) {
    const parsedError = fromZodError(response.error);
    return ValidationError(parsedError.message);
  }

  return response.data as z.infer<T>;
};
