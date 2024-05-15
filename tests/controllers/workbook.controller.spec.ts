import { DataSource } from 'typeorm';
import { Application } from 'express';
import { ConfigurationReader } from '../../src/reader/configuration.reader';
import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import App from '../../src/app';
import { AuthBuilder } from '../AuthBuilder';
import supertest from 'supertest';

import { WorkbookPaths } from '../../src/controllers/workbook.controller';
import { workbookFromFile } from '../workbook';
import {
  makeInMemoryRepoProvider,
  makeInMemoryWorkbookRepo,
} from '../repositories/workbook.repo.spec';
import { InMemoryAuthentication } from './in.memory.authentication';

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
      makeInMemoryRepoProvider(makeInMemoryWorkbookRepo()),
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
    expect(response.body).toEqual(workbookFromFile().toJson());
  });

  it('should fail return workbook if user is unauthenticated', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .get(WorkbookPaths.get)
      .set(auth.toHeaderPair().key, 'Bearer invalid token')
      .send();
    expect(response.status).toBe(401);
  });
});
