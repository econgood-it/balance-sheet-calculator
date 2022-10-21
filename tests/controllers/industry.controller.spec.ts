import { Connection } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../src/configuration.reader';
import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import App from '../../src/app';
import { TokenProvider } from '../TokenProvider';
import supertest from 'supertest';

describe('Industry Controller', () => {
  let connection: Connection;
  let app: Application;
  const configuration = ConfigurationReader.read();
  const userTokenHeader = {
    key: 'Authorization',
    value: '',
  };

  beforeAll(async () => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        configuration
      );
    app = new App(connection, configuration).app;
    userTokenHeader.value = `Bearer ${await TokenProvider.provideValidUserToken(
      app,
      connection
    )}`;
  });

  afterAll(async () => {
    await connection.close();
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
          name: 'agriculture, forestry management, fishing industry',
        }),
        expect.objectContaining({
          industryCode: 'Ch',
          name: 'Production of electronic equipment, instruments and components as well as computers (C26, C27, C28)',
        }),
        expect.objectContaining({
          industryCode: 'U',
          name: 'Extraterritorial organisations and bodies',
        }),
      ])
    );
  });
});
