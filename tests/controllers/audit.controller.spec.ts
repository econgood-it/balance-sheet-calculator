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
import { Role, User } from '../../src/models/user';
import { v4 as uuid4 } from 'uuid';
import { makeAudit } from '../../src/models/audit';
import { ICertificationAuthorityRepo } from '../../src/repositories/certification.authority.repo';
import { CertificationAuthorityNames } from '@ecogood/e-calculator-schemas/dist/audit.dto';

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

  const isoString = '2025-03-27T00:00:00.000Z';

  async function createBalanceSheet(user?: User) {
    const fixedDate = new Date(isoString);
    jest.spyOn(global, 'Date').mockImplementation(() => fixedDate);
    const organization = await organizationRepo.save(
      makeOrganization().invite(auth.user.email).join(auth.user)
    );
    return await balanceSheetRepository.save(
      makeBalanceSheet().assignOrganization(organization)
    );
  }

  it('should submit balance sheet for audit', async () => {
    const balanceSheet = await createBalanceSheet();
    const auditJson = {
      balanceSheetToBeSubmitted: balanceSheet.id,
      certificationAuthority: CertificationAuthorityNames.AUDIT,
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
    expect(result.submittedBalanceSheetId).toEqual(balanceSheet.id);
    const foundOriginalCopy = await balanceSheetRepository.findByIdOrFail(
      result.originalCopyId!
    );
    expect(foundOriginalCopy.id).toEqual(result.originalCopyId!);
    const foundAuditCopy = await balanceSheetRepository.findByIdOrFail(
      result.auditCopyId!
    );
    expect(foundAuditCopy.id).toEqual(result.auditCopyId!);
    const certificationAuthority = await certificationAuthorityRepo.findByName(
      CertificationAuthorityNames.AUDIT
    );
    expect(foundAuditCopy.organizationId).toEqual(
      certificationAuthority.organizationId
    );
  });

  it('should submit balance sheet for audit fails if audit exists already', async () => {
    const audit = await createAudit();
    const auditJson = {
      balanceSheetToBeSubmitted: audit.submittedBalanceSheetId,
      certificationAuthority: CertificationAuthorityNames.AUDIT,
    };
    const testApp = supertest(app);
    const response = await testApp
      .post(AuditPaths.post)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .send(auditJson);
    expect(response.status).toBe(409);
  });

  it('should create peer group audit for balance sheet', async () => {
    const balanceSheet = await createBalanceSheet();
    const auditJson = {
      balanceSheetToBeSubmitted: balanceSheet.id,
      certificationAuthority: CertificationAuthorityNames.PEER_GROUP,
    };
    const testApp = supertest(app);
    const response = await testApp
      .post(AuditPaths.post)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .send(auditJson);
    expect(response.status).toBe(200);
    expect(response.body.id).toBeDefined();
    const certificationAuthority = await certificationAuthorityRepo.findByName(
      CertificationAuthorityNames.PEER_GROUP
    );
    const result = await auditRepository.findByIdOrFail(response.body.id!);

    const foundAuditCopy = await balanceSheetRepository.findByIdOrFail(
      result.auditCopyId!
    );
    expect(foundAuditCopy.organizationId).toEqual(
      certificationAuthority.organizationId
    );
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
      certificationAuthority: CertificationAuthorityNames.AUDIT,
    };
    const testApp = supertest(app);
    const response = await testApp
      .post(AuditPaths.post)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .send(auditJson);
    expect(response.status).toBe(403);
  });

  async function createAudit() {
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
    return await auditRepository.save(
      makeAudit().submitBalanceSheet(balanceSheetEntity, certificationAuthority)
    );
  }

  it('should get audit for balance sheet', async () => {
    const audit = await createAudit();
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
      certificationAuthority: CertificationAuthorityNames.AUDIT,
    });
  });

  it('should get audit for balance sheet fails if user is not member of audit or peer group organization', async () => {
    const audit = await createAudit();
    const testApp = supertest(app);
    const response = await testApp
      .get(`/v1/audit/${audit.id}`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value);
    expect(response.status).toBe(403);
  });

  it('should find audit by submitted balance sheet', async () => {
    const audit = await createAudit();
    const testApp = supertest(app);
    const response = await testApp
      .get(`/v1/audit?submittedBalanceSheetId=${audit.submittedBalanceSheetId}`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value);
    expect(response.status).toBe(200);
    expect(response.body.id).toEqual(audit.id);
  });

  it('should fail with 404 if audit could not be found by submitted balance sheet', async () => {
    await createAudit();
    const testApp = supertest(app);
    const response = await testApp
      .get(`/v1/audit?submittedBalanceSheetId=919291929`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value);
    expect(response.status).toBe(404);
  });

  it('should fail to find audit by submitted balance sheet if user has no permission', async () => {
    const audit = await createAudit();
    const testApp = supertest(app);
    const response = await testApp
      .get(`/v1/audit?submittedBalanceSheetId=${audit.submittedBalanceSheetId}`)
      .set(auditApiUser.toHeaderPair().key, auditApiUser.toHeaderPair().value);
    expect(response.status).toBe(403);
  });
});
