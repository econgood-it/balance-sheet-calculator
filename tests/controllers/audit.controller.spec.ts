import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { Application } from 'express';
import supertest from 'supertest';
import { DataSource, Repository } from 'typeorm';
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
import { BalanceSheet, makeBalanceSheet } from '../../src/models/balance.sheet';

describe('Audit Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  let balanceSheetRepository: Repository<BalanceSheet>;
  const configuration = ConfigurationReader.read();
  const authBuilder = new AuthBuilder();
  const auth = authBuilder.addUser();

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    const repoProvider = makeRepoProvider(configuration);
    balanceSheetRepository = repoProvider.getBalanceSheetRepo(
      dataSource.manager
    );

    app = new App(
      dataSource,
      configuration,
      repoProvider,
      new InMemoryAuthentication(authBuilder.getTokenMap())
    ).app;
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should create audit for balance sheet', async () => {
    // const balanceSheetEntity = await balanceSheetRepository.save(
    //   makeBalanceSheet()
    // );
    // const auditJson = {
    //   balanceSheetToBeSubmitted: balanceSheetEntity.id,
    // };
    // const testApp = supertest(app);
    // const response = await testApp
    //   .post(AuditPaths.submit)
    //   .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
    //   .send(auditJson);
    // expect(response.status).toBe(200);
    // expect(response.body.id).toBeUndefined();
  });
});
