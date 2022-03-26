import { Connection } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../src/configuration.reader';
import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import App from '../../src/app';
import { TokenProvider } from '../TokenProvider';
import supertest from 'supertest';
import { Region } from '../../src/entities/region';
import { BalanceSheetVersion } from '../../src/entities/enums';

describe('Region Controller', () => {
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

  it('should regions with countryCode and countryName', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .get('/v1/regions')
      .set(userTokenHeader.key, userTokenHeader.value)
      .send();
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ countryCode: 'BEL', countryName: 'Belgium' }),
        expect.objectContaining({ countryCode: 'DEU', countryName: 'Germany' }),
      ])
    );
  });

  it('should return only regions for given balance sheet version', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .get(`/v1/regions?version=${BalanceSheetVersion.v5_0_4}`)
      .set(userTokenHeader.key, userTokenHeader.value)
      .send();
    expect(response.status).toBe(200);
    const expected = await connection
      .getRepository(Region)
      .count({ validFromVersion: BalanceSheetVersion.v5_0_4 });
    expect(response.body.length).toEqual(expected);
  });
});
