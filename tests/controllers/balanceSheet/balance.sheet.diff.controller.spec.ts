import supertest from 'supertest';
import { Connection } from 'typeorm';
import { DatabaseConnectionCreator } from '../../../src/database.connection.creator';
import App from '../../../src/app';
import { Application } from 'express';
import { ConfigurationReader } from '../../../src/configuration.reader';

import { TokenProvider } from '../../TokenProvider';
import path from 'path';

describe('Balance Sheet Controller', () => {
  let connection: Connection;
  let app: Application;
  const configuration = ConfigurationReader.read();

  const tokenHeader = {
    key: 'Authorization',
    value: '',
  };

  beforeAll(async () => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        configuration
      );
    app = new App(connection, configuration).app;
    tokenHeader.value = `Bearer ${await TokenProvider.provideValidUserToken(
      app,
      connection
    )}`;
  });

  afterAll(async () => {
    await connection.close();
  });

  it('returns diff between uploaded excel file and API', async () => {
    const testApp = supertest(app);
    const fileDir = path.resolve(__dirname, '../../testData');
    const response = await testApp
      .post('/v1/balancesheets/diff/upload')
      .set(tokenHeader.key, tokenHeader.value)
      .attach(
        'balanceSheet',
        path.join(fileDir, 'full_5_0_7_unprotected.xlsx')
      );
    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({ lhs: 'upload', rhs: 'api' });
    expect(response.body.diffTopicWeights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'E', lhs: 1, path: ['E4'], rhs: 0.5 }),
      ])
    );
  });
});
