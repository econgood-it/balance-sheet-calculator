import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import { DataSource } from 'typeorm';
import { ConfigurationReader } from '../../src/reader/configuration.reader';
import { makeBalanceSheet } from '../../src/models/balance.sheet';
import {
  IBalanceSheetRepo,
  makeBalanceSheetRepository,
} from '../../src/repositories/balance.sheet.repo';
import {
  IOrganizationRepo,
  makeOrganizationRepository,
} from '../../src/repositories/organization.repo';
import {
  IAuditRepo,
  makeAuditRepository,
} from '../../src/repositories/audit.repo';
import { makeAudit } from '../../src/models/audit';
import { makeOrganization } from '../../src/models/organization';
import { makeCertificationAuthority } from '../../src/models/certification.authoriy';
import { CertificationAuthorityNames } from '@ecogood/e-calculator-schemas/dist/audit.dto';

describe('AuditRepo', () => {
  let balanceSheetRepository: IBalanceSheetRepo;
  let auditRepository: IAuditRepo;
  let orgaRepository: IOrganizationRepo;
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      ConfigurationReader.read()
    );
    balanceSheetRepository = makeBalanceSheetRepository(dataSource.manager);
    auditRepository = makeAuditRepository(dataSource.manager);
    orgaRepository = makeOrganizationRepository(dataSource.manager);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('saves audit', async () => {
    const balanceSheet = await balanceSheetRepository.save(makeBalanceSheet());
    const auditOrganization = await orgaRepository.save(makeOrganization());
    const certificationAuthority = makeCertificationAuthority({
      name: CertificationAuthorityNames.AUDIT,
      organizationId: auditOrganization.id!,
    });

    const audit = makeAudit().submitBalanceSheet(
      balanceSheet,
      certificationAuthority
    );
    const savedAudit = await auditRepository.save(audit);
    const { id } = await auditRepository.save(savedAudit);
    const result = await auditRepository.findByIdOrFail(id!);
    expect(result.submittedAt).toEqual(audit.submittedAt);
    expect(result.submittedAt).toBeInstanceOf(Date);
    expect(result.submittedBalanceSheetId).toEqual(balanceSheet.id);
    expect(result.balanceSheetToCopy).toBeUndefined();

    const foundOriginalCopy = await balanceSheetRepository.findByIdOrFail(
      result.originalCopyId!
    );
    expect(foundOriginalCopy.id).toEqual(result.originalCopyId!);
    const foundAuditCopy = await balanceSheetRepository.findByIdOrFail(
      result.auditCopyId!
    );
    expect(foundAuditCopy.id).toEqual(result.auditCopyId!);
  });

  it('find audit by submitted balance sheet id', async () => {
    const balanceSheet = await balanceSheetRepository.save(makeBalanceSheet());
    const auditOrganization = await orgaRepository.save(makeOrganization());
    const certificationAuthority = makeCertificationAuthority({
      name: CertificationAuthorityNames.AUDIT,
      organizationId: auditOrganization.id!,
    });

    const audit = makeAudit().submitBalanceSheet(
      balanceSheet,
      certificationAuthority
    );
    const savedAudit = await auditRepository.save(audit);
    const result = await auditRepository.findBySubmittedBalanceSheetId(
      balanceSheet.id!
    );
    expect(result).toEqual(savedAudit);
  });
});
