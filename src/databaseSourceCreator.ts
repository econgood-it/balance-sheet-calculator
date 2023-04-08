import { DataSource } from 'typeorm';
import { Configuration } from './configuration.reader';

export class DatabaseSourceCreator {
  public static async createDataSource(
    configuration: Configuration
  ): Promise<DataSource> {
    return new DataSource({
      type: 'postgres',
      host: configuration.dbHost,
      port: configuration.dbPort,
      username: configuration.dbUser,
      password: configuration.dbPassword,
      database: configuration.dbName,
      synchronize: false,
      logging: false,
      entities: [configuration.entityRegex],
      migrations: [configuration.migrationRegex],
    });
  }

  public static async createDataSourceAndRunMigrations(
    configuration: Configuration
  ): Promise<DataSource> {
    const dataSource = await DatabaseSourceCreator.createDataSource(
      configuration
    );
    await dataSource.initialize();
    await dataSource.runMigrations({ transaction: 'each' });
    return dataSource;
  }
}
