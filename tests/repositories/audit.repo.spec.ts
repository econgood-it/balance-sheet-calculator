import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import { DataSource } from 'typeorm';
import { ConfigurationReader } from '../../src/reader/configuration.reader';
import { makeOrganization } from '../../src/models/organization';
import { makeBalanceSheet } from '../../src/models/balance.sheet';
import {
  IBalanceSheetRepo,
  makeBalanceSheetRepository,
} from '../../src/repositories/balance.sheet.repo';
import {
  IOrganizationRepo,
  makeOrganizationRepository,
} from '../../src/repositories/organization.repo';

describe('AuditRepo', () => {
  let balanceSheetRepository: IBalanceSheetRepo;
  let auditRepository: IAuditRepo;
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      ConfigurationReader.read()
    );
    balanceSheetRepository = makeBalanceSheetRepository(dataSource.manager);
    auditRepository = makeOrganizationRepository(dataSource.manager);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('saves audit', async () => {
    const balanceSheet = await balanceSheetRepository.save(makeBalanceSheet());
    const audit = makeAudit();
    audit.submitBalanceSheet(balanceSheet);
    const auditEntity = await auditRepository.save(audit);
    const result = await auditRepository.findByIdOrFail(auditEntity.id!);
    expect(result.id).toBeDefined();
    expect(result.id).toEqual(auditEntity.id);
    expect(result.submittedBalanceSheetId).toEqual(balanceSheet.id);
  });
});
