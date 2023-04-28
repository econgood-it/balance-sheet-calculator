import { DataSource } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../src/reader/configuration.reader';
import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import App from '../../src/app';
import { TokenProvider } from '../TokenProvider';
import supertest from 'supertest';
import { InMemoryRepoProvider } from '../../src/repositories/repo.provider';
import { WorkbookEntity } from '../../src/entities/workbook.entity';
import { InMemoryWorkbookEntityRepo } from '../../src/repositories/workbook.entity.repo';
import { organizationFactory } from '../../src/openapi/examples';
import { Role } from '../../src/entities/enums';

describe('Workbook Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  const userTokenHeader = {
    key: 'Authorization',
    value: '',
  };

  const sections = [
    { shortName: 'A1', title: 'A1 title' },
    { shortName: 'D1', title: 'D1 title' },
    { shortName: 'C2', title: 'C2 title' },
  ];
  const workbook = new WorkbookEntity(sections);
  const workbookPath = '/v1/workbook';

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    app = new App(
      dataSource,
      configuration,
      new InMemoryRepoProvider(new InMemoryWorkbookEntityRepo(workbook))
    ).app;
    userTokenHeader.value = `Bearer ${await TokenProvider.provideValidUserToken(
      app,
      dataSource
    )}`;
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should return workbook', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .get(workbookPath)
      .set(userTokenHeader.key, userTokenHeader.value)
      .send();
    expect(response.status).toBe(200);
    expect(response.body).toEqual(workbook.toJson());
  });

  it('should fail return workbook if user is unauthenticated', async () => {
    const orgaJson = organizationFactory.default();
    const testApp = supertest(app);
    const response = await testApp
      .get(workbookPath)
      .set(userTokenHeader.key, 'Bearer invalid token')
      .send(orgaJson);
    expect(response.status).toBe(401);
  });

  it('should fail to return workbook if user is admin', async () => {
    const adminTokenHeader = await TokenProvider.provideValidAuthHeader(
      app,
      dataSource,
      Role.Admin
    );
    const orgaJson = organizationFactory.default();
    const testApp = supertest(app);
    const response = await testApp
      .get(workbookPath)
      .set(adminTokenHeader.key, adminTokenHeader.value)
      .send(orgaJson);
    expect(response.status).toBe(403);
  });
});
