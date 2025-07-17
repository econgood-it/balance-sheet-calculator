import { NextFunction, Request, Response } from 'express';

import ForbiddenException from '../exceptions/forbidden.exception';
import { Role } from '../models/user';

export const allowUserOnly = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.authenticatedUser && ( req.authenticatedUser.role === Role.User ) ) {
    return next();
  } else {
    return next(new ForbiddenException('No access'));
  }
};

export const allowAnyone = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.authenticatedUser ) {
    return next();
  } else {
    return next(new ForbiddenException('No access'));
  }
};

export const allowMemberOfCertificationAuthority = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.authenticatedUser && ( req.authenticatedUser.role === Role.Auditor || req.authenticatedUser.role === Role.Peer ) ) {
    return next();
  } else {
    return next(new ForbiddenException('No access'));
  }
};
