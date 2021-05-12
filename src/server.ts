import 'reflect-metadata';
import { DatabaseConnectionCreator } from './database.connection.creator';
import { Connection } from 'typeorm';
import App from './app';
import { LoggingService } from './logging';
import { ConfigurationReader } from './configuration.reader';

const configuration = ConfigurationReader.read();

DatabaseConnectionCreator.createConnectionAndRunMigrations(configuration)
  .then(async (connection: Connection) => {
    const app = new App(connection, configuration);
    app.start();
  })
  .catch((error) => LoggingService.error(error.message, error));
