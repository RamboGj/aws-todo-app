import { HttpStatusCode } from 'axios';
import { BaseError } from '../utils/error';

export const ValidationError = (message?: string): never => {
  const error = new BaseError(message || 'ValidationError');
  error.name = 'VALIDATION_ERROR';
  error.statusCode = HttpStatusCode.BadRequest;
  throw error;
};
