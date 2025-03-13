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
import { makeOrganization } from '../../src/models/organization';
import { IOrganizationRepo } from '../../src/repositories/organization.repo';
import { Role } from '../../src/models/user';
import { v4 as uuid4 } from 'uuid';

describe('Audit Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  let organizationRepo: IOrganizationRepo;
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
    organizationRepo = repoProvider.getOrganizationRepo(dataSource.manager);
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
    const organization = await organizationRepo.save(
      makeOrganization().invite(auth.user.email).join(auth.user)
    );
    const balanceSheetEntity = await balanceSheetRepository.save(
      makeBalanceSheet().assignOrganization(organization)
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
    const foundOriginalCopy = await balanceSheetRepository.findByIdOrFail(
      result.originalCopyId!
    );
    expect(foundOriginalCopy.id).toEqual(result.originalCopyId!);
    const foundAuditCopy = await balanceSheetRepository.findByIdOrFail(
      result.auditCopyId!
    );
    expect(foundAuditCopy.id).toEqual(result.auditCopyId!);
  });

  it('should fail to submit balance sheet to audit if user has not the right permissions', async () => {
    const user = { id: uuid4(), email: 'other@example.com', role: Role.User };
    const organization = await organizationRepo.save(
      makeOrganization().invite(user.email).join(user)
    );
    const balanceSheetEntity = await balanceSheetRepository.save(
      makeBalanceSheet().assignOrganization(organization)
    );

    const auditJson = {
      balanceSheetToBeSubmitted: balanceSheetEntity.id,
    };
    const testApp = supertest(app);
    const response = await testApp
      .post(AuditPaths.post)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .send(auditJson);
    expect(response.status).toBe(403);
  });
});
