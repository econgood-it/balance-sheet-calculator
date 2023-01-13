import supertest from 'supertest';
import { Connection } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../src/configuration.reader';
import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import App from '../../src/app';
import { balanceSheetFactory } from '../testData/balance.sheet';

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
    const testApp = supertest(app);
    const response = await testApp
      .post(endpointPath)
      .set('API_TOKEN', 'TOKEN')
      .send(balanceSheetFactory.emptyV508());
    expect(response.status).toEqual(200);
  });
});
