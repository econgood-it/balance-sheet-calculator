import { DataSource, Repository } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../src/reader/configuration.reader';
import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import App from '../../src/app';
import { AuthBuilder } from '../AuthBuilder';
import supertest from 'supertest';
import { ApiKey } from '../../src/entities/api.key';
import { v4 as uuid4 } from 'uuid';
import { RepoProvider } from '../../src/repositories/repo.provider';

describe('ApiKeyController', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  let apiKeyRepository: Repository<ApiKey>;

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    app = new App(dataSource, configuration, new RepoProvider(configuration))
      .app;
    apiKeyRepository = dataSource.getRepository(ApiKey);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should create new api key for user', async () => {
    const auth = await new AuthBuilder(app, dataSource).build();
    const testApp = supertest(app);
    const response = await testApp
      .post(`/v1/apikeys`)
      .set(auth.authHeader.key, auth.authHeader.value);
    expect(response.status).toBe(200);

    const apiKey = await apiKeyRepository.findOne({
      where: { user: { email: auth.email } },
    });
    expect(apiKey).toBeDefined();
    expect(parseInt(response.body.apiKey.split('.')[0])).toBe(apiKey?.id);
  });

  it('should delete api key', async () => {
    const auth = await new AuthBuilder(app, dataSource).build();
    const testApp = supertest(app);
    await testApp
      .post(`/v1/apikeys`)
      .set(auth.authHeader.key, auth.authHeader.value);

    const apiKey = await apiKeyRepository.findOne({
      where: { user: { email: auth.email } },
    });
    expect(apiKey).toBeDefined();

    const response = await testApp
      .del(`/v1/apikeys/${apiKey?.id}`)
      .set(auth.authHeader.key, auth.authHeader.value);
    expect(response.status).toBe(200);
    const apiKeyFound = await apiKeyRepository.findOne({
      where: { id: apiKey?.id },
    });
    expect(apiKeyFound).toBeNull();
  });

  it('should fail on api key deletion if user has not the permissions', async () => {
    const auth = await new AuthBuilder(app, dataSource).build();
    const testApp = supertest(app);
    await testApp
      .post(`/v1/apikeys`)
      .set(auth.authHeader.key, auth.authHeader.value);
    const apiKey = await apiKeyRepository.findOne({
      where: { user: { email: auth.email } },
    });

    const authWithoutPermission = await new AuthBuilder(
      app,
      dataSource
    ).build();

    const response = await testApp
      .del(`/v1/apikeys/${apiKey?.id}`)
      .set(
        authWithoutPermission.authHeader.key,
        authWithoutPermission.authHeader.value
      );
    expect(response.status).toBe(401);
    expect(
      await apiKeyRepository.findOne({
        where: { user: { email: auth.email } },
      })
    ).toBeDefined();
  });
});
