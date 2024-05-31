import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { Application } from 'express';
import supertest from 'supertest';
import { DataSource } from 'typeorm';
import App from '../../../src/app';
import { DatabaseSourceCreator } from '../../../src/databaseSourceCreator';

import {
  makeJsonFactory,
  makeOrganizationCreateRequest,
} from '../../../src/openapi/examples';
import { ConfigurationReader } from '../../../src/reader/configuration.reader';

import { AuthBuilder } from '../../AuthBuilder';
import { InMemoryAuthentication } from '../in.memory.authentication';
import { makeRepoProvider } from '../../../src/repositories/repo.provider';
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
      makeRepoProvider(configuration),
      new InMemoryAuthentication(authBuilder.getTokenMap())
    ).app;
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should calculated balance sheet without saving results', async () => {
    const balanceSheetJson = {
      type: BalanceSheetType.Full,
      version: BalanceSheetVersion.v5_0_9,
      companyFacts: makeJsonFactory().emptyCompanyFacts(),
    };
    const testApp = supertest(app);
    const response = await testApp
      .post(BalanceSheetPaths.post)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .send(balanceSheetJson);
    expect(response.status).toBe(200);
    expect(response.body.id).toBeUndefined();
  });

  it('should return matrix for balance sheet without saving results', async () => {
    const balanceSheetJson = {
      type: BalanceSheetType.Full,
      version: BalanceSheetVersion.v5_0_9,
      companyFacts: makeJsonFactory().emptyCompanyFacts(),
    };
    const testApp = supertest(app);
    const response = await testApp
      .post(BalanceSheetPaths.matrixWithoutSave)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .send(balanceSheetJson);
    expect(response.status).toBe(200);
    expect(response.body.id).toBeUndefined();
    expect(response.body.ratings).toHaveLength(20);
  });

  it('should fail to create balance sheet if user is unauthenticated', async () => {
    const orgaJson = makeOrganizationCreateRequest();
    const testApp = supertest(app);
    const response = await testApp
      .post(BalanceSheetPaths.post)
      .set('Authorization', 'Bearer invalid token')
      .send(orgaJson);
    expect(response.status).toBe(401);
  });
});
