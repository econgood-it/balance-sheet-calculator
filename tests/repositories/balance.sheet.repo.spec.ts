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

describe('BalanceSheetRepo', () => {
  let balanceSheetRepository: IBalanceSheetRepo;
  let organizationRepository: IOrganizationRepo;
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      ConfigurationReader.read()
    );
    balanceSheetRepository = makeBalanceSheetRepository(dataSource.manager);
    organizationRepository = makeOrganizationRepository(dataSource.manager);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('loads organization relation', async () => {
    const organization = await organizationRepository.save(makeOrganization());
    const balanceSheet = makeBalanceSheet();
    const savedResult = await balanceSheetRepository.save(
      balanceSheet.assignOrganization(organization)
    );
    const result = await balanceSheetRepository.findByIdOrFail(savedResult.id!);

    expect(result.organizationId).toEqual(organization.id);
    expect(result.organizationId).toBeDefined();
  });

  // it('fails if the value of balance sheet column is invalid', async () => {
  //   const balanceSheetEntity = await balanceSheetRepository.save(
  //     new BalanceSheetEntity(undefined, balanceSheetFactory.emptyFullV508())
  //   );
  //   const balanceSheetJson = {
  //     ...balanceSheetEntity.toOldBalanceSheet(),
  //     invalid_field: 'This is invalid',
  //   };
  //   await dataSource.query(
  //     `UPDATE balance_sheet_entity SET "balanceSheet" = '${JSON.stringify(
  //       balanceSheetJson
  //     )}'::jsonb WHERE id = ${balanceSheetEntity.id};`
  //   );
  //   await expect(
  //     balanceSheetRepository.findByIdOrFail(balanceSheetEntity.id!)
  //   ).rejects.toThrow(
  //     new RegExp(
  //       `.*Column balanceSheet is not valid.*"idOfEntity":${balanceSheetEntity.id}.*unrecognized_keys.*invalid_field`,
  //       'i'
  //     )
  //   );
  //   await dataSource.query(
  //     `UPDATE balance_sheet_entity SET "balanceSheet" = '${JSON.stringify(
  //       balanceSheetEntity.toOldBalanceSheet()
  //     )}'::jsonb WHERE id = ${balanceSheetEntity.id};`
  //   );
  // });
});
