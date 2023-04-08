import { DataSource, Repository } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../src/configuration.reader';
import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import App from '../../src/app';
import { TokenProvider } from '../TokenProvider';
import supertest from 'supertest';
import { ApiKey } from '../../src/entities/api.key';
import { v4 as uuid4 } from 'uuid';

describe('ApiKeyController', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  let apiKeyRepository: Repository<ApiKey>;

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    app = new App(dataSource, configuration).app;
    apiKeyRepository = dataSource.getRepository(ApiKey);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should create new api key for user', async () => {
    const userEmail = `${uuid4()}@example.com`;
    const token = `Bearer ${await TokenProvider.provideValidUserToken(
      app,
      dataSource,
      userEmail
    )}`;
    const testApp = supertest(app);
    const response = await testApp
      .post(`/v1/apikeys`)
      .set('Authorization', token);
    expect(response.status).toBe(200);

    const apiKey = await apiKeyRepository.findOne({
      where: { user: { email: userEmail } },
    });
    expect(apiKey).toBeDefined();
    expect(parseInt(response.body.apiKey.split('.')[0])).toBe(apiKey?.id);
  });

  it('should delete api key', async () => {
    const userEmail = `${uuid4()}@example.com`;
    const token = `Bearer ${await TokenProvider.provideValidUserToken(
      app,
      dataSource,
      userEmail
    )}`;
    const testApp = supertest(app);
    await testApp.post(`/v1/apikeys`).set('Authorization', token);

    const apiKey = await apiKeyRepository.findOne({
      where: { user: { email: userEmail } },
    });
    expect(apiKey).toBeDefined();

    const response = await testApp
      .del(`/v1/apikeys/${apiKey?.id}`)
      .set('Authorization', token);
    expect(response.status).toBe(200);
    const apiKeyFound = await apiKeyRepository.findOne({
      where: { id: apiKey?.id },
    });
    expect(apiKeyFound).toBeNull();
  });

  it('should fail on api key deletion if user has not the permissions', async () => {
    const userEmail = `${uuid4()}@example.com`;
    const token = `Bearer ${await TokenProvider.provideValidUserToken(
      app,
      dataSource,
      userEmail
    )}`;
    const testApp = supertest(app);
    await testApp.post(`/v1/apikeys`).set('Authorization', token);
    const apiKey = await apiKeyRepository.findOne({
      where: { user: { email: userEmail } },
    });

    const tokenWithoutPermission = `Bearer ${await TokenProvider.provideValidUserToken(
      app,
      dataSource,
      `${uuid4()}@example.com`
    )}`;

    const response = await testApp
      .del(`/v1/apikeys/${apiKey?.id}`)
      .set('Authorization', tokenWithoutPermission);
    expect(response.status).toBe(401);
    expect(
      await apiKeyRepository.findOne({
        where: { user: { email: userEmail } },
      })
    ).toBeDefined();
  });
});
