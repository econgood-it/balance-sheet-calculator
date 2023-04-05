import { Application, NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { User } from '../entities/user';
import { Connection } from 'typeorm';
import UnauthorizedException from '../exceptions/unauthorized.exception';
import { Role } from '../entities/enums';
import { Configuration } from '../configuration.reader';
import { BasicStrategy } from 'passport-http';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { API_KEY_RELATIONS, ApiKey } from '../entities/api.key';

class JWTAuthentication {
  constructor(private connection: Connection) {}

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
      this.connection.manager
        .transaction(async (entityManager) => {
          const userRepository = entityManager.getRepository(User);
          const foundUser = await userRepository.findOneOrFail({
            where: {
              email: payload.email,
            },
          });

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
  constructor(private connection: Connection) {}

  public initialize() {
    passport.use('headerapikey', this.getStrategy());
    return passport.initialize();
  }

  private getStrategy(): Strategy {
    return new HeaderAPIKeyStrategy(
      { header: 'Api-Key', prefix: '' },
      false,
      (apikey: string, done: any) => {
        this.connection.manager
          .transaction(async (entityManager) => {
            const apiRepository = entityManager.getRepository(ApiKey);
            const [id, value] = apikey.split('.');
            const foundApiKey = await apiRepository.findOneOrFail({
              where: {
                id: parseInt(id),
              },
              relations: API_KEY_RELATIONS,
            });
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

  constructor(private connection: Connection) {
    this.jwtAuthentication = new JWTAuthentication(connection);
    this.apiKeyAuthentication = new ApiKeyAuthentication(connection);
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
