import { Application, Request } from 'express';
import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { User } from './entities/user';
import { Connection } from 'typeorm';
import UnauthorizedException from './exceptions/unauthorized.exception';

export class Authentication {
  constructor(private connection: Connection) {}

  public addJwtAuthToApplication(app: Application, jwtSecret: string) {
    app.use(this.initialize(jwtSecret));
    const apiBase = '/';
    app.all(apiBase + '*', (req, res, next) => {
      if (req.path.includes(apiBase + 'users/token')) return next();

      return this.authenticate((err: any, user: any, info: any) => {
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
        req.user = user;
        return next();
      })(req, res, next);
    });
  }

  public initialize = (jwtSecret: string) => {
    passport.use('jwt', this.getStrategy(jwtSecret));
    return passport.initialize();
  };

  private getStrategy = (jwtSecret: string): Strategy => {
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
            email: payload.email,
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
  };

  private authenticate = (callback: any) =>
    passport.authenticate(
      'jwt',
      { session: false, failWithError: true },
      callback
    );
}
