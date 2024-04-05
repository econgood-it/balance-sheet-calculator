import { DataSource } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../src/reader/configuration.reader';
import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import App from '../../src/app';
import { AuthBuilder } from '../AuthBuilder';
import supertest from 'supertest';

import { oldOrganizationFactory } from '../../src/openapi/examples';
import { WorkbookPaths } from '../../src/controllers/workbook.controller';
import { workbookEntityFromFile } from '../workbook';
import {
  InMemoryRepoProvider,
  InMemoryWorkbookEntityRepo,
} from '../repositories/workbook.entity.repo.spec';
import { InMemoryAuthentication } from './in.memory.authentication';
import { makeRepoProvider } from '../../src/repositories/repo.provider';

describe('Workbook Controller', () => {
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
      makeRepoProvider(configuration),
      new InMemoryRepoProvider(new InMemoryWorkbookEntityRepo()),
      new InMemoryAuthentication(authBuilder.getTokenMap())
    ).app;
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should return workbook', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .get(WorkbookPaths.get)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .send();
    expect(response.status).toBe(200);
    expect(response.body).toEqual(workbookEntityFromFile().toJson());
  });

  it('should fail return workbook if user is unauthenticated', async () => {
    const orgaJson = oldOrganizationFactory.default();
    const testApp = supertest(app);
    const response = await testApp
      .get(WorkbookPaths.get)
      .set(auth.toHeaderPair().key, 'Bearer invalid token')
      .send(orgaJson);
    expect(response.status).toBe(401);
  });
});
