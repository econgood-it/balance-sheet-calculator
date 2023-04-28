import supertest from 'supertest';
import { DataSource } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../src/reader/configuration.reader';
import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import App from '../../src/app';
import { TokenProvider } from '../TokenProvider';
import { balanceSheetJsonFactory } from '../../src/openapi/examples';
import { RepoProvider } from '../../src/repositories/repo.provider';

describe('Authentication', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  const endpointPath = '/v1/balancesheets';

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    app = new App(dataSource, configuration, new RepoProvider(configuration))
      .app;
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should allow requests with a valid api token', async () => {
    const token = `Bearer ${await TokenProvider.provideValidUserToken(
      app,
      dataSource
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
