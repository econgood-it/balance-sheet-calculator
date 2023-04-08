import 'reflect-metadata';
import { DatabaseSourceCreator } from './databaseSourceCreator';
import { DataSource } from 'typeorm';

import { LoggingService } from './logging';
import { ConfigurationReader } from './configuration.reader';
import { AdminAccountCreator } from './admin.account.creator';
import { Role } from './entities/enums';
import App from './app';

declare global {
  namespace Express {
    export interface Request {
      correlationId(): string | undefined;
      userInfo?: { id: number; email: string; role: Role };
      file?: Express.Multer.File;
    }
  }
}

const configuration = ConfigurationReader.read();

DatabaseSourceCreator.createDataSourceAndRunMigrations(configuration)
  .then(async (dataSource: DataSource) => {
    await AdminAccountCreator.saveAdmin(dataSource, configuration);
    const app = new App(dataSource, configuration);
    app.start();
  })
  .catch((error) => {
    LoggingService.error(error.message, {}, error);
    console.log(error);
  });
