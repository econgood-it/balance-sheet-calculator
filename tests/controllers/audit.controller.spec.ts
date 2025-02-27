import { Application } from 'express';
import supertest from 'supertest';
import { DataSource } from 'typeorm';

import { makeBalanceSheet } from '../../src/models/balance.sheet';
import { AuditPaths } from '../../src/controllers/audit.controller';
import { IBalanceSheetRepo } from '../../src/repositories/balance.sheet.repo';
import { IAuditRepo } from '../../src/repositories/audit.repo';
import { ConfigurationReader } from '../../src/reader/configuration.reader';
import { AuthBuilder } from '../AuthBuilder';
import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import { makeRepoProvider } from '../../src/repositories/repo.provider';
import { InMemoryAuthentication } from './in.memory.authentication';
import App from '../../src/app';

describe('Audit Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  let balanceSheetRepository: IBalanceSheetRepo;
  let auditRepository: IAuditRepo;

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
    auditRepository = repoProvider.getAuditRepo(dataSource.manager);

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
    const balanceSheetEntity = await balanceSheetRepository.save(
      makeBalanceSheet()
    );
    const auditJson = {
      balanceSheetToBeSubmitted: balanceSheetEntity.id,
    };
    const testApp = supertest(app);
    const response = await testApp
      .post(AuditPaths.post)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .send(auditJson);
    expect(response.status).toBe(200);
    expect(response.body.id).toBeDefined();
    const result = await auditRepository.findByIdOrFail(response.body.id!);
    expect(result.submittedBalanceSheetId).toEqual(balanceSheetEntity.id);
    const foundCopy = await balanceSheetRepository.findByIdOrFail(
      result.balanceSheetCopy!.id!
    );
    expect(foundCopy.id).toEqual(result.balanceSheetCopy!.id!);
    // expect(response.body.id).toBeUndefined();
  });
});
