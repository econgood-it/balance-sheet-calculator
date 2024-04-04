import 'reflect-metadata';
import { DatabaseSourceCreator } from './databaseSourceCreator';
import { DataSource } from 'typeorm';

import { LoggingService } from './logging';
import { ConfigurationReader } from './reader/configuration.reader';
import { User as AuthUser } from './models/user';
import App from './app';
import { OldRepoProvider } from './repositories/oldRepoProvider';
import { ZitadelAuthentication } from './security/authentication';

declare global {
  namespace Express {
    export interface Request {
      correlationId(): string | undefined;
      authenticatedUser?: AuthUser;
      file?: Express.Multer.File;
    }
  }
}

const configuration = ConfigurationReader.read();

DatabaseSourceCreator.createDataSourceAndRunMigrations(configuration)
  .then(async (dataSource: DataSource) => {
    const app = new App(
      dataSource,
      configuration,
      new OldRepoProvider(configuration),
      new ZitadelAuthentication(
        configuration.zitadelKeyId,
        configuration.zitadelKey,
        configuration.zitadelAppId,
        configuration.zitadelClientId
      )
    );
    app.start();
  })
  .catch((error) => {
    LoggingService.error(error.message, {}, error);
    console.log(error);
  });
