import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import { DataSource } from 'typeorm';
import { ConfigurationReader } from '../../src/reader/configuration.reader';
import { BalanceSheetEntity } from '../../src/entities/balance.sheet.entity';

import {
  balanceSheetFactory,
  organizationFactory,
} from '../../src/openapi/examples';
import { v4 as uuid4 } from 'uuid';
import {
  BalanceSheetEntityRepository,
  IBalanceSheetEntityRepo,
} from '../../src/repositories/old.balance.sheet.entity.repo';
import { OrganizationEntity } from '../../src/entities/organization.entity';
import { OldOrganizationEntityRepository } from '../../src/repositories/oldOrganization.entity.repo';
import { OrganizationDBSchema } from '../../src/entities/schemas/organization.schema';

describe('BalanceSheetRepo', () => {
  let balanceSheetEntityRepository: IBalanceSheetEntityRepo;
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      ConfigurationReader.read()
    );
    balanceSheetEntityRepository = new BalanceSheetEntityRepository(
      dataSource.manager
    );
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('loads organization relation', async () => {
    const email = `${uuid4()}@example.com`;
    const user = { id: email };
    const organizationRepo = new OldOrganizationEntityRepository(
      dataSource.manager
    );
    const organizationEntity = await organizationRepo.save(
      new OrganizationEntity(
        undefined,
        OrganizationDBSchema.parse(organizationFactory.default()),
        [user]
      )
    );
    const balanceSheetEntity = new BalanceSheetEntity(
      undefined,
      balanceSheetFactory.emptyFullV508()
    );
    const savedResult = await balanceSheetEntityRepository.save(
      balanceSheetEntity
    );
    organizationEntity.addBalanceSheetEntity(balanceSheetEntity);
    await organizationRepo.save(organizationEntity);
    const result = await balanceSheetEntityRepository.findByIdOrFail(
      savedResult.id!
    );

    expect(result.organizationEntity?.id).toEqual(organizationEntity.id);
    expect(result.organizationEntity?.hasMember(user)).toBeTruthy();
  });

  it('fails if the value of balance sheet column is invalid', async () => {
    const balanceSheetEntity = await balanceSheetEntityRepository.save(
      new BalanceSheetEntity(undefined, balanceSheetFactory.emptyFullV508())
    );
    const balanceSheetJson = {
      ...balanceSheetEntity.toOldBalanceSheet(),
      invalid_field: 'This is invalid',
    };
    await dataSource.query(
      `UPDATE balance_sheet_entity SET "balanceSheet" = '${JSON.stringify(
        balanceSheetJson
      )}'::jsonb WHERE id = ${balanceSheetEntity.id};`
    );
    await expect(
      balanceSheetEntityRepository.findByIdOrFail(balanceSheetEntity.id!)
    ).rejects.toThrow(
      new RegExp(
        `.*Column balanceSheet is not valid.*"idOfEntity":${balanceSheetEntity.id}.*unrecognized_keys.*invalid_field`,
        'i'
      )
    );
    await dataSource.query(
      `UPDATE balance_sheet_entity SET "balanceSheet" = '${JSON.stringify(
        balanceSheetEntity.toOldBalanceSheet()
      )}'::jsonb WHERE id = ${balanceSheetEntity.id};`
    );
  });
});
