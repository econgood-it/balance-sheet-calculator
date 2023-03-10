import supertest from 'supertest';
import { Connection } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../src/configuration.reader';
import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import App from '../../src/app';
import { balanceSheetJsonFactory } from '../testData/balance.sheet';
import { TokenProvider } from '../TokenProvider';

describe('Authentication', () => {
  let connection: Connection;
  let app: Application;
  const configuration = ConfigurationReader.read();
  const endpointPath = '/v1/balancesheets';

  beforeAll(async () => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        configuration
      );
    app = new App(connection, configuration).app;
  });

  it('should allow requests with a valid api token', async () => {
    const token = `Bearer ${await TokenProvider.provideValidUserToken(
      app,
      connection
    )}`;
    const testApp = supertest(app);
    const apiKeyResponse = await testApp
      .post(`/v1/apikeys`)
      .set('Authorization', token);
    expect(apiKeyResponse.status).toBe(200);
    const response = await testApp
      .post(endpointPath)
      .set('Api-Key', `${apiKeyResponse.body.apiKey}`)
      .send(balanceSheetJsonFactory.emptyV508());
    expect(response.status).toEqual(200);
  });

  it('should disallow requests with a invalid api token', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .post(endpointPath)
      .set('Api-Key', `38.wrongkey`)
      .send(balanceSheetJsonFactory.emptyV508());
    expect(response.status).toEqual(401);
  });
});
