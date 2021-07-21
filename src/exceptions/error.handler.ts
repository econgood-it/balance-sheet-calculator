import { NextFunction } from 'express';
import { JsonMappingError } from '@daniel-faber/json-ts';
import BadRequestException from './bad.request.exception';
import { ValidationError } from 'class-validator';
import { EntityNotFoundError } from 'typeorm';
import NotFoundException from './not.found.exception';
import InternalServerException from './internal.server.exception';
import { NoAccessError } from './no.access.error';
import ForbiddenException from './forbidden.exception';

export const handle = (error: Error, next: NextFunction) => {
  if (error instanceof JsonMappingError) {
    return next(new BadRequestException(error.message));
  }
  if (
    Array.isArray(error) &&
    error.every((item) => item instanceof ValidationError)
  ) {
    return next(new BadRequestException(error.toString()));
  }
  if (error instanceof EntityNotFoundError) {
    return next(new NotFoundException(error.message));
  }
  if (error instanceof NoAccessError) {
    return next(new ForbiddenException(error.message));
  }
  return next(new InternalServerException(error.message));
};
