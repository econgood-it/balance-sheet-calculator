import { DataSource } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../src/reader/configuration.reader';
import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import App from '../../src/app';
import { Auth, AuthBuilder } from '../AuthBuilder';
import supertest from 'supertest';
import { RepoProvider } from '../../src/repositories/repo.provider';

describe('Region Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  let auth: Auth;

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    app = new App(dataSource, configuration, new RepoProvider(configuration))
      .app;
    auth = await new AuthBuilder(app, dataSource).build();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should regions with countryCode and countryName', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .get('/v1/regions')
      .set(auth.authHeader.key, auth.authHeader.value)
      .send();
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ countryCode: 'BEL', countryName: 'Belgium' }),
        expect.objectContaining({ countryCode: 'DEU', countryName: 'Germany' }),
      ])
    );
  });
});
