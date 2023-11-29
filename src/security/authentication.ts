import express, { Application, NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { BasicStrategy } from 'passport-http';
import { Strategy } from 'passport-strategy';
import { ZitadelIntrospectionStrategy } from 'passport-zitadel';
import UnauthorizedException from '../exceptions/unauthorized.exception';
import { Role } from '../models/user';
import { Configuration } from '../reader/configuration.reader';

export interface IAuthenticationProvider {
  initialize: () => express.Handler;
  authenticate: (req: Request, res: Response, next: NextFunction) => void;
}

export class ZitadelAuthentication implements IAuthenticationProvider {
  constructor(
    private keyId: string,
    private key: string,
    private appId: string,
    private clientId: string
  ) {}

  public initialize() {
    passport.use('zitadel-introspection', this.getStrategy());
    return passport.initialize();
  }

  private getStrategy(): Strategy {
    return new ZitadelIntrospectionStrategy({
      authority: 'https://econgood-kmtyuy.zitadel.cloud',
      authorization: {
        type: 'jwt-profile',
        profile: {
          type: 'application',
          keyId: this.keyId,
          key: this.key,
          appId: this.appId,
          clientId: this.clientId,
        },
      },
    });
  }

  public authenticate(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      'zitadel-introspection',
      { session: false },
      (err: any, user: { sub: string; email?: string; scope: string }) => {
        if (err) {
          return next(new UnauthorizedException(err.message));
        }
        if (!(user && user.email)) {
          return next(new UnauthorizedException('User information missing'));
        }
        req.authenticatedUser = {
          id: user.sub,
          email: user.email,
          role: user.scope.split(' ').some((s) => s.includes('role:admin'))
            ? Role.Admin
            : Role.User,
        };

        return next();
      }
    )(req, res, next);
  }
}

export class Authentication {
  constructor(private authenticationProvider: IAuthenticationProvider) {}

  public addBasicAuthToDocsEndpoint(
    app: Application,
    configuration: Configuration
  ) {
    app.use(passport.initialize());
    const authenticated = (username: string, password: string): boolean =>
      username === configuration.docsUser &&
      password === configuration.docsPassword;
    const strategy = new BasicStrategy(
      async (username: string, password: string, done: any) => {
        if (!authenticated(username, password)) {
          done('Wrong credentials');
        } else {
          done(null, { username });
        }
      }
    );
    passport.use(strategy);
    app.use('/v1/docs', passport.authenticate('basic', { session: false }));
  }

  public addAuthToApplication(app: Application) {
    app.use(this.authenticationProvider.initialize());
    const pathsToExcludeFromAuthentication = ['users/token', 'check', 'docs'];
    const apiBase = '/';
    app.all(apiBase + '*', (req, res, next) => {
      if (
        pathsToExcludeFromAuthentication.filter((pathToExclude) =>
          req.path.includes(apiBase + pathToExclude)
        ).length > 0
      ) {
        return next();
      }
      return this.authenticationProvider.authenticate(req, res, next);
    });
  }
}
