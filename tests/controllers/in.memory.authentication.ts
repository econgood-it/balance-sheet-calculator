import { Role, User } from '../../src/models/user';
import passport from 'passport';
import { Strategy } from 'passport-strategy';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { NextFunction, Request, Response } from 'express';
import UnauthorizedException from '../../src/exceptions/unauthorized.exception';
import { IAuthenticationProvider } from '../../src/security/authentication';

export class InMemoryAuthentication implements IAuthenticationProvider {
  constructor(private tokenToUsersMap: Map<string, User>) {}

  public initialize() {
    passport.use('headerapikey', this.getStrategy());
    return passport.initialize();
  }

  private getStrategy(): Strategy {
    return new HeaderAPIKeyStrategy(
      { header: 'Authorization', prefix: 'Bearer ' },
      false,
      (token: string, done: any) => {
        if (this.tokenToUsersMap.has(token)) {
          return done(null, this.tokenToUsersMap.get(token));
        }
        done(new Error('Invalid token'));
      }
    );
  }

  public authenticate(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      'headerapikey',
      { session: false, failWithError: true },
      (err: any, user: { id: string; email: string; role: Role }) => {
        if (err) {
          return next(new UnauthorizedException(err.message));
        }
        // @ts-ignore
        req.authenticatedUser = user;
        return next();
      }
    )(req, res, next);
  }
}
