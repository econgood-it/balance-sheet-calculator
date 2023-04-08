import { DataSource } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../src/configuration.reader';
import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import App from '../../src/app';
import { TokenProvider } from '../TokenProvider';
import supertest from 'supertest';

describe('Industry Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  const userTokenHeader = {
    key: 'Authorization',
    value: '',
  };

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    app = new App(dataSource, configuration).app;
    userTokenHeader.value = `Bearer ${await TokenProvider.provideValidUserToken(
      app,
      dataSource
    )}`;
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should return industry with industry code and name', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .get('/v1/industries')
      .set(userTokenHeader.key, userTokenHeader.value)
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
