import supertest from 'supertest';
import { DataSource } from 'typeorm';
import { DatabaseSourceCreator } from '../../../src/databaseSourceCreator';
import App from '../../../src/app';
import { Application } from 'express';
import { ConfigurationReader } from '../../../src/reader/configuration.reader';

import { Auth, AuthBuilder } from '../../AuthBuilder';
import path from 'path';
import { RepoProvider } from '../../../src/repositories/repo.provider';

describe('Balance Sheet Controller', () => {
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

  it('returns diff between uploaded excel file and API', async () => {
    const testApp = supertest(app);
    const fileDir = path.resolve(__dirname, '../../reader/balanceSheetReader');
    const response = await testApp
      .post('/v1/balancesheets/diff/upload')
      .set(auth.authHeader.key, auth.authHeader.value)
      .attach('balanceSheet', path.join(fileDir, 'full_5_0_8.xlsx'));
    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({ lhs: 'upload', rhs: 'api' });
    expect(response.body.diffTopicWeights).toBeUndefined();
  });
});
