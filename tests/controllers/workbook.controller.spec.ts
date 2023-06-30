import { DataSource } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../src/reader/configuration.reader';
import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import App from '../../src/app';
import { Auth, AuthBuilder } from '../AuthBuilder';
import supertest from 'supertest';
import { InMemoryRepoProvider } from '../../src/repositories/repo.provider';
import { WorkbookEntity } from '../../src/entities/workbook.entity';
import { InMemoryWorkbookEntityRepo } from '../../src/repositories/workbook.entity.repo';
import { organizationFactory } from '../../src/openapi/examples';

describe('Workbook Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();

  const sections = [
    { shortName: 'A1', title: 'A1 title' },
    { shortName: 'D1', title: 'D1 title' },
    { shortName: 'C2', title: 'C2 title' },
  ];
  const workbook = new WorkbookEntity(sections);
  const workbookPath = '/v1/workbook';
  let auth: Auth;

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    app = new App(
      dataSource,
      configuration,
      new InMemoryRepoProvider(new InMemoryWorkbookEntityRepo(workbook))
    ).app;
    auth = await new AuthBuilder(app, dataSource).build();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should return workbook', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .get(workbookPath)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send();
    expect(response.status).toBe(200);
    expect(response.body).toEqual(workbook.toJson());
  });

  it('should fail return workbook if user is unauthenticated', async () => {
    const orgaJson = organizationFactory.default();
    const testApp = supertest(app);
    const response = await testApp
      .get(workbookPath)
      .set(auth.authHeader.key, 'Bearer invalid token')
      .send(orgaJson);
    expect(response.status).toBe(401);
  });

  it('should fail to return workbook if user is admin', async () => {
    const adminAuth = await new AuthBuilder(app, dataSource).admin().build();
    const orgaJson = organizationFactory.default();
    const testApp = supertest(app);
    const response = await testApp
      .get(workbookPath)
      .set(adminAuth.authHeader.key, adminAuth.authHeader.value)
      .send(orgaJson);
    expect(response.status).toBe(403);
  });
});
