import {Application} from "express";
import {BasicStrategy} from "passport-http";
import passport from "passport";
import {Environment} from "./environment";

export class Authentication {
    public addBasicAuthToApplication(app: Application, environment: Environment) {
        app.use(passport.initialize());
        const authenticated = (username: string, password: string) => username === environment.username &&
            password === environment.password;
        const strategy = new BasicStrategy(async (username, password, done) => {
            const authenicated = await authenticated(username, password);
            if (!authenicated) {
                done('Wrong credentials');
            } else {
                done(null, {username})
            }
        })
        passport.use(strategy);
        app.use("/", passport.authenticate('basic', {session: false}))
    }
}