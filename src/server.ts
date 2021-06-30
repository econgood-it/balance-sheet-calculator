import 'reflect-metadata';
import { DatabaseConnectionCreator } from './database.connection.creator';
import { Connection } from 'typeorm';
import App from './app';
import { LoggingService } from './logging';
import { ConfigurationReader } from './configuration.reader';
import { AdminAccountCreator } from './admin.account.creator';

declare global {
  namespace Express {
    export interface Request {
      correlationId(): string;
    }
  }
}

const configuration = ConfigurationReader.read();

DatabaseConnectionCreator.createConnectionAndRunMigrations(configuration)
  .then(async (connection: Connection) => {
    await AdminAccountCreator.saveAdmin(connection, configuration);
    const app = new App(connection, configuration);
    app.start();
  })
  .catch((error) => LoggingService.error(error.message, error));
