import { NextFunction } from 'express';
import BadRequestException from './bad.request.exception';
import { EntityNotFoundError } from 'typeorm';
import NotFoundException from './not.found.exception';
import InternalServerException from './internal.server.exception';
import { NoAccessError } from './no.access.error';
import ForbiddenException from './forbidden.exception';
import UnauthorizedException from './unauthorized.exception';
import { ZodError } from 'zod';
import { DatabaseValidationError } from './databaseValidationError';
import { ConflictError } from './conflict.error';
import { ConflictException } from './conflict.exception';
import { ValueError } from './value.error';

export const handle = (error: Error, next: NextFunction) => {
  if (error instanceof ZodError) {
    return next(new BadRequestException(JSON.parse(error.message)));
  }
  if (error instanceof ValueError) {
    return next(new BadRequestException(error.message));
  }
  if (error instanceof EntityNotFoundError) {
    return next(new NotFoundException(error.message));
  }
  if (error instanceof NoAccessError) {
    return next(new ForbiddenException(error.message));
  }
  if (error instanceof ConflictError) {
    return next(new ConflictException(error.message));
  }
  if (error instanceof DatabaseValidationError) {
    return next(new InternalServerException(JSON.parse(error.message)));
  }
  if (
    error instanceof BadRequestException ||
    error instanceof UnauthorizedException ||
    error instanceof ForbiddenException ||
    error instanceof NotFoundException
  ) {
    return next(error);
  }
  return next(new InternalServerException(error.message));
};
