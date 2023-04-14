import { Application, NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { DataSource } from 'typeorm';
import UnauthorizedException from '../exceptions/unauthorized.exception';
import { Role } from '../entities/enums';
import { Configuration } from '../configuration.reader';
import { BasicStrategy } from 'passport-http';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { IRepoProvider } from '../repositories/repo.provider';

class JWTAuthentication {
  constructor(
    private dataSource: DataSource,
    private repoProvider: IRepoProvider
  ) {}

  public initialize(jwtSecret: string) {
    passport.use('jwt', this.getStrategy(jwtSecret));
    return passport.initialize();
  }

  private getStrategy(jwtSecret: string): Strategy {
    const params = {
      secretOrKey: jwtSecret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('bearer'),
      passReqToCallback: true,
    };

    return new Strategy(params, (req: Request, payload: any, done: any) => {
      this.dataSource.manager
        .transaction(async (entityManager) => {
          const userRepository =
            this.repoProvider.getUserEntityRepo(entityManager);
          const foundUser = await userRepository.findByEmailOrFail(
            payload.email
          );

          return done(null, {
            id: foundUser.id,
            email: foundUser.email,
            role: foundUser.role,
          });
        })
        .catch(() => {
          done(new Error('Invalid token'));
        });
    });
  }

  public authenticate(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      'jwt',
      { session: false, failWithError: true },
      (
        err: any,
        user: { id: number; email: string; role: Role },
        info: any
      ) => {
        if (err) {
          return next(new UnauthorizedException(err.message));
        }

        if (!user) {
          if (info.name === 'TokenExpiredError') {
            return res.status(401).json({
              message: 'Your token has expired. Please generate a new one',
            });
          } else {
            return res.status(401).json({ message: info.message });
          }
        }
        req.userInfo = user;
        return next();
      }
    )(req, res, next);
  }
}

class ApiKeyAuthentication {
  constructor(
    private dataSource: DataSource,
    private repoProvider: IRepoProvider
  ) {}

  public initialize() {
    passport.use('headerapikey', this.getStrategy());
    return passport.initialize();
  }

  private getStrategy(): Strategy {
    return new HeaderAPIKeyStrategy(
      { header: 'Api-Key', prefix: '' },
      false,
      (apikey: string, done: any) => {
        this.dataSource.manager
          .transaction(async (entityManager) => {
            const apiRepository =
              this.repoProvider.getApiKeyRepo(entityManager);
            const [id, value] = apikey.split('.');
            const foundApiKey = await apiRepository.findByIdOrFail(
              parseInt(id)
            );
            if (!foundApiKey.compareValue(value)) {
              throw Error('Invalid value');
            }

            return done(null, {
              id: foundApiKey.user.id,
              email: foundApiKey.user.email,
              role: foundApiKey.user.role,
            });
          })
          .catch(() => {
            done(new Error('Invalid api key'));
          });
      }
    );
  }

  public authenticate(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      'headerapikey',
      { session: false, failWithError: true },
      (
        err: any,
        user: { id: number; email: string; role: Role },
        info: any
      ) => {
        if (err) {
          return next(new UnauthorizedException(err.message));
        }

        if (!user) {
          if (info.name === 'TokenExpiredError') {
            return res.status(401).json({
              message: 'Your token has expired. Please generate a new one',
            });
          } else {
            return res.status(401).json({ message: info.message });
          }
        }
        req.userInfo = user;
        return next();
      }
    )(req, res, next);
  }
}

export class Authentication {
  private jwtAuthentication: JWTAuthentication;
  private apiKeyAuthentication: ApiKeyAuthentication;

  constructor(private dataSource: DataSource, repoProvider: IRepoProvider) {
    this.jwtAuthentication = new JWTAuthentication(dataSource, repoProvider);
    this.apiKeyAuthentication = new ApiKeyAuthentication(
      dataSource,
      repoProvider
    );
  }

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

  public addAuthToApplication(app: Application, jwtSecret: string) {
    app.use(this.jwtAuthentication.initialize(jwtSecret));
    app.use(this.apiKeyAuthentication.initialize());
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
      return req.headers.authorization
        ? this.jwtAuthentication.authenticate(req, res, next)
        : this.apiKeyAuthentication.authenticate(req, res, next);
    });
  }
}
