import { Application } from "express";
import { BasicStrategy } from "passport-http";
import passport from "passport";

export class Authentication {
    public addBasicAuthToApplication(app: Application) {
        app.use(passport.initialize());
        if (!process.env.USERNAME || !process.env.PASSWORD) {
            throw Error('Environment variables for authentification are not set.');
        }
        const authenticated = (username: string, password: string) => username === process.env.USERNAME &&
            password === process.env.PASSWORD;
        const strategy = new BasicStrategy(async (username: string, password: string, done: any) => {
            const authenicated = await authenticated(username, password);
            if (!authenicated) {
                done('Wrong credentials');
            } else {
                done(null, { username })
            }
        })
        passport.use(strategy);
        app.use("/", passport.authenticate('basic', { session: false }))
    }
}