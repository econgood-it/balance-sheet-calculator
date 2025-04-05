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
import { makeAudit } from '../../src/models/audit';
import { ICertificationAuthorityRepo } from '../../src/repositories/certification.authority.repo';
import { CertificationAuthorityNames } from '../../src/entities/certification.authority.entity';

describe('Audit Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  let organizationRepo: IOrganizationRepo;
  let balanceSheetRepository: IBalanceSheetRepo;
  let certificationAuthorityRepo: ICertificationAuthorityRepo;
  let auditRepository: IAuditRepo;

  const configuration = ConfigurationReader.read();
  const authBuilder = new AuthBuilder();
  const auth = authBuilder.addUser();
  const auditApiUser = authBuilder.addApiAuditUser(configuration);

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
    certificationAuthorityRepo = repoProvider.getCertificationAuthorityRepo(
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
    const isoString = '2025-03-27T00:00:00.000Z';
    const fixedDate = new Date(isoString);
    jest.spyOn(global, 'Date').mockImplementation(() => fixedDate);
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
    expect(response.body.submittedAt).toEqual(isoString);
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

  it('should get audit for balance sheet', async () => {
    const isoString = '2025-03-27T00:00:00.000Z';
    const fixedDate = new Date(isoString);
    jest.spyOn(global, 'Date').mockImplementation(() => fixedDate);
    const organization = await organizationRepo.save(
      makeOrganization().invite(auth.user.email).join(auth.user)
    );
    const balanceSheetEntity = await balanceSheetRepository.save(
      makeBalanceSheet().assignOrganization(organization)
    );
    const certificationAuthority = await certificationAuthorityRepo.findByName(
      CertificationAuthorityNames.AUDIT
    );
    const audit = await auditRepository.save(
      makeAudit().submitBalanceSheet(
        balanceSheetEntity,
        certificationAuthority.organizationId!
      )
    );

    const testApp = supertest(app);
    const response = await testApp
      .get(`/v1/audit/${audit.id}`)
      .set(auditApiUser.toHeaderPair().key, auditApiUser.toHeaderPair().value);
    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      id: audit.id,
      auditCopyId: audit.auditCopyId,
      originalCopyId: audit.originalCopyId,
      submittedBalanceSheetId: audit.submittedBalanceSheetId,
      submittedAt: audit.submittedAt!.toISOString(),
    });
  });

  it('should get audit for balance sheet fails if user is not member of audit organization', async () => {
    const isoString = '2025-03-27T00:00:00.000Z';
    const fixedDate = new Date(isoString);
    jest.spyOn(global, 'Date').mockImplementation(() => fixedDate);
    const organization = await organizationRepo.save(
      makeOrganization().invite(auth.user.email).join(auth.user)
    );
    const balanceSheetEntity = await balanceSheetRepository.save(
      makeBalanceSheet().assignOrganization(organization)
    );
    const certificationAuthority = await certificationAuthorityRepo.findByName(
      CertificationAuthorityNames.AUDIT
    );
    const audit = await auditRepository.save(
      makeAudit().submitBalanceSheet(
        balanceSheetEntity,
        certificationAuthority.organizationId!
      )
    );

    const testApp = supertest(app);
    const response = await testApp
      .get(`/v1/audit/${audit.id}`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value);
    expect(response.status).toBe(403);
  });
});

/*
Missing authorization for audit get endpoint.

Authorization could be if user has permission to access at least one of the connected balance sheets

GET /v1/audit?balanceSheet=id





GET /v1/audit/id


{ id: number, // Audit Entit orginalId: number, // Company Orga origanalCopyId: number, // Audit Orga auditCopyId: number // Audit Orga }
endpoint to create audit for balance sheet

POST /v1/audit with body

{{{}}

balanceSheetToBeSubmitted: <id>

}

Does internally all the copy logic and saves the references between the balance sheets in a AuditProcessEntity or AuditEntity.
endpoint to perform updates on audit

PUT /v1/audit/7

{{{}}

action: re-import

}

Overites balance sheet copy of original in audit organization by the new orignal

 */
