import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import {BasicStrategy} from "passport-http";
import passport from "passport";
import {Environment} from "./environment";
import {Authentication} from "./authentication";
import {CompanyFactsQLSchema} from "./graphql/CompanyFactsQLSchema";
const graphqlExpress = require("express-graphql");

class App {
    public app: Application;

    public environment: Environment;
    private authentication: Authentication;

    constructor() {
        this.app = express();
        this.environment = new Environment();
        this.authentication = new Authentication();
        this.setConfig();
        this.setMongoConfig();
    }

    private setConfig() {
        this.app.use(bodyParser.json({ limit: '50mb' }));
        this.app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
        this.app.use(cors());
        this.app.use('/balancesheets', graphqlExpress({
            schema: CompanyFactsQLSchema,
            rootValue: global,
            graphiql: true
        }));
        this.authentication.addBasicAuthToApplication(this.app, this.environment);
    }

    //Connecting to our MongoDB database
    private setMongoConfig() {
        mongoose.Promise = global.Promise;
        mongoose.connect(this.environment.dbUrl, {
            useNewUrlParser: true,
            useFindAndModify: false
        });
    }
}

const application = new App();
export default application.app;