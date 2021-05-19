import { NextFunction, Response } from 'express';
import { Role } from '../entities/enums';
import ForbiddenException from '../exceptions/forbidden.exception';

export const allowAdminOnly = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  if (req.user && req.user.role && req.user.role === Role.Admin) {
    return next();
  } else {
    return next(new ForbiddenException('No access'));
  }
};

export const allowUserOnly = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  if (req.user && req.user.role && req.user.role === Role.User) {
    return next();
  } else {
    return next(new ForbiddenException('No access'));
  }
};
