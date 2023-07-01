import { ZodError } from 'zod';

export class DatabaseValidationError extends Error {
  constructor(validationError: ZodError, info?: string, idOfEntity?: number) {
    super(JSON.stringify({ info, idOfEntity, error: validationError }));
  }
}
