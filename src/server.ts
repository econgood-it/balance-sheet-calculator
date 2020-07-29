
import "reflect-metadata";
import { DatabaseConnectionCreator } from "./DatabaseConnectionCreator";
import { Connection } from "typeorm";
import App from "./app";
import { LoggingService } from "./logging";


DatabaseConnectionCreator.createConnectionAndRunMigrations().then(async (connection: Connection) => {
    const app = new App(connection);
    app.start();
}).catch(error => LoggingService.error(error.message, error));