import { NextFunction, Request, Response } from 'express';
import { Role } from '../entities/enums';
import ForbiddenException from '../exceptions/forbidden.exception';

export const allowAdminOnly = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.userInfo && req.userInfo.role === Role.Admin) {
    return next();
  } else {
    return next(new ForbiddenException('No access'));
  }
};

export const allowUserOnly = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.userInfo && req.userInfo.role === Role.User) {
    return next();
  } else {
    return next(new ForbiddenException('No access'));
  }
};
