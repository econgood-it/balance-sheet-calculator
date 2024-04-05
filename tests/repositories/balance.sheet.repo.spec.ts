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

    expect(savedResult.organizationId).toEqual(organization.id);
    expect(result.organizationId).toEqual(organization.id);
    expect(result.organizationId).toBeDefined();
  });

  it('fails if the value of balance sheet column is invalid', async () => {
    const balanceSheet = await balanceSheetRepository.save(makeBalanceSheet());
    const balanceSheetJson = {
      ...balanceSheet,
      invalid_field: 'This is invalid',
    };
    await dataSource.query(
      `UPDATE balance_sheet_entity SET "balanceSheet" = '${JSON.stringify(
        balanceSheetJson
      )}'::jsonb WHERE id = ${balanceSheet.id};`
    );
    await expect(
      balanceSheetRepository.findByIdOrFail(balanceSheet.id!)
    ).rejects.toThrow(
      new RegExp(
        `.*Column balanceSheet is not valid.*"idOfEntity":${balanceSheet.id}.*unrecognized_keys.*invalid_field`,
        'i'
      )
    );
    // Reset the balance sheet column to the original value
    await dataSource.query(
      `UPDATE balance_sheet_entity SET "balanceSheet" = '${JSON.stringify({
        ...balanceSheet,
      })}'::jsonb WHERE id = ${balanceSheet.id};`
    );
  });

  it('removes balance sheet', async () => {
    const balanceSheet = await balanceSheetRepository.save(makeBalanceSheet());
    await balanceSheetRepository.remove(balanceSheet);
    await expect(
      balanceSheetRepository.findByIdOrFail(balanceSheet.id!)
    ).rejects.toThrow();
  });

  it('saves and finds all balance sheet entities of organization', async () => {
    const organization = await organizationRepository.save(makeOrganization());
    const otherOrganization = await organizationRepository.save(
      makeOrganization()
    );
    const balanceSheet1 = await balanceSheetRepository.save(
      makeBalanceSheet().assignOrganization(organization)
    );
    const balanceSheet2 = await balanceSheetRepository.save(
      makeBalanceSheet().assignOrganization(organization)
    );
    await balanceSheetRepository.save(
      makeBalanceSheet().assignOrganization(otherOrganization)
    );

    const foundBalanceSheets = await balanceSheetRepository.findByOrganization(
      organization
    );
    foundBalanceSheets.forEach((b) =>
      expect(b.organizationId).toEqual(organization.id)
    );
    expect(foundBalanceSheets.map((b) => b.id)).toEqual([
      balanceSheet1.id,
      balanceSheet2.id,
    ]);
  });
});
