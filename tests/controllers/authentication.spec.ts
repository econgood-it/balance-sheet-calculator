import supertest from 'supertest';
import { DataSource } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../src/reader/configuration.reader';
import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import App from '../../src/app';
import { AuthBuilder } from '../AuthBuilder';
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
    const auth = await new AuthBuilder(app, dataSource).build();
    const testApp = supertest(app);
    const apiKeyResponse = await testApp
      .post(`/v1/apikeys`)
      .set(auth.authHeader.key, auth.authHeader.value);
    expect(apiKeyResponse.status).toBe(200);
    const response = await testApp
      .post(endpointPath)
      .set('Api-Key', `${apiKeyResponse.body.apiKey}`)
      .send(balanceSheetJsonFactory.emptyFullV508());
    expect(response.status).toEqual(200);
  });

  it('should disallow requests with a invalid api token', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .post(endpointPath)
      .set('Api-Key', `38.wrongkey`)
      .send(balanceSheetJsonFactory.emptyFullV508());
    expect(response.status).toEqual(401);
  });
});
