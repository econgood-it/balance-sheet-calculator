import supertest from 'supertest';
import { DataSource } from 'typeorm';
import { DatabaseSourceCreator } from '../../../src/databaseSourceCreator';
import App from '../../../src/app';
import { Application } from 'express';
import { ConfigurationReader } from '../../../src/reader/configuration.reader';

import { AuthBuilder } from '../../AuthBuilder';
import path from 'path';
import { RepoProvider } from '../../../src/repositories/repo.provider';
import { InMemoryAuthentication } from '../in.memory.authentication';
import { BalanceSheetPaths } from '../../../src/controllers/balance.sheet.controller';

describe('Balance Sheet Controller', () => {
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

  it('returns diff between uploaded excel file and API', async () => {
    const testApp = supertest(app);
    const fileDir = path.resolve(__dirname, '../../reader/balanceSheetReader');
    const response = await testApp
      .post(BalanceSheetPaths.diff)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .attach('balanceSheet', path.join(fileDir, 'full_5_0_8.xlsx'));
    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({ lhs: 'upload', rhs: 'api' });
    expect(response.body.diffTopicWeights).toBeUndefined();
  });
});
