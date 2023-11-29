import { DataSource } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../src/reader/configuration.reader';
import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import App from '../../src/app';
import { AuthBuilder } from '../AuthBuilder';
import supertest from 'supertest';
import { RepoProvider } from '../../src/repositories/repo.provider';
import { InMemoryAuthentication } from './in.memory.authentication';

describe('Industry Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  const authBuilder = new AuthBuilder();
  const auth = authBuilder.addUser();

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    app = new App(
      dataSource,
      configuration,
      new RepoProvider(configuration),
      new InMemoryAuthentication(authBuilder.getTokenMap())
    ).app;
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should return industry with industry code and name', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .get('/v1/industries')
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .send();
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          industryCode: 'A',
          industryName: 'agriculture, forestry management, fishing industry',
        }),
        expect.objectContaining({
          industryCode: 'Ch',
          industryName:
            'Production of electronic equipment, instruments and components as well as computers (C26, C27, C28)',
        }),
        expect.objectContaining({
          industryCode: 'U',
          industryName: 'Extraterritorial organisations and bodies',
        }),
      ])
    );
  });
});
