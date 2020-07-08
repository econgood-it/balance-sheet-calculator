
import "reflect-metadata";
import { DatabaseConnectionCreator } from "./DatabaseConnectionCreator";
import { Connection } from "typeorm";
import App from "./app";
import { LoggingService } from "./logging";

DatabaseConnectionCreator.createConnection().then((connection: Connection) => {
    const app = new App(connection);
    connection.runMigrations().then(() => { app.start(); }).catch(error => LoggingService.error(error));
}).catch(error => LoggingService.error(error));