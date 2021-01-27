import {Application, Request} from "express";
import {Strategy, ExtractJwt} from "passport-jwt";
import passport from "passport";
import { Configuration } from "./configuration.reader";

export class Authentication {

    public addJwtAuthToApplication(app: Application, jwtSecret: string) {
        app.use(this.initialize(jwtSecret));
        const apiBase = '/';
        app.all(apiBase + "*", (req, res, next) => {
            if (req.path.includes(apiBase + "login")) return next();

            return this.authenticate((err:any, user:any, info:any) => {
                if (err) { return next(err); }
                console.log(`User: ${user}`);
                if (!user) {
                    if (info.name === "TokenExpiredError") {
                        return res.status(401).json({ message: "Your token has expired. Please generate a new one" });
                    } else {
                        return res.status(401).json({ message: info.message });
                    }
                }
                app.set("user", user);
                return next();
            })(req, res, next);
        });
    }

    public initialize = (jwtSecret: string) => {
        passport.use("jwt", this.getStrategy(jwtSecret));
        return passport.initialize();
    }

    private getStrategy = (jwtSecret: string): Strategy => {
        const params = {
            secretOrKey: jwtSecret,
            jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("bearer"),
            passReqToCallback: true
        };

        return new Strategy(params, (req: Request, payload: any, done: any) => {
            return done(null, { _id: 2, username: 'michael' });
            // User.findOne({ "username": payload.username }, (err, user) => {
            //     /* istanbul ignore next: passport response */
            //     if (err) {
            //         return done(err);
            //     }
            //     /* istanbul ignore next: passport response */
            //     if (user === null) {
            //         return done(null, false, { message: "The user in the token was not found" });
            //     }
            //
            //     return done(null, { _id: user._id, username: user.username });
            // });
        });
    }

    private authenticate = (callback: any) => passport.authenticate("jwt", { session: false, failWithError: true }, callback);
}