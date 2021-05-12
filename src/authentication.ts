import { Application } from 'express';
import { BasicStrategy } from 'passport-http';
import passport from 'passport';
import { Configuration } from './configuration.reader';

export class Authentication {
  public addBasicAuthToApplication(
    app: Application,
    configuration: Configuration
  ) {
    app.use(passport.initialize());
    const authenticated = (username: string, password: string) =>
      username === configuration.appUsername &&
      password === configuration.appPassword;
    const strategy = new BasicStrategy(
      async (username: string, password: string, done: any) => {
        const authenicated = await authenticated(username, password);
        if (!authenicated) {
          done('Wrong credentials');
        } else {
          done(null, { username });
        }
      }
    );
    passport.use(strategy);
    app.use('/', passport.authenticate('basic', { session: false }));
  }
}
