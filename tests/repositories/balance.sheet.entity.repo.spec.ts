import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import { DataSource } from 'typeorm';
import { ConfigurationReader } from '../../src/reader/configuration.reader';
import { BalanceSheetEntity } from '../../src/entities/balance.sheet.entity';
import { Role } from '../../src/entities/enums';
import { User } from '../../src/entities/user';
import {
  balanceSheetFactory,
  organizationFactory,
} from '../../src/openapi/examples';
import { v4 as uuid4 } from 'uuid';
import {
  BalanceSheetEntityRepository,
  IBalanceSheetEntityRepo,
} from '../../src/repositories/balance.sheet.entity.repo';
import { OrganizationEntity } from '../../src/entities/organization.entity';
import { UserEntityRepository } from '../../src/repositories/user.entity.repo';
import { OrganizationEntityRepository } from '../../src/repositories/organization.entity.repo';

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

  it('does not cascades users on insert', async () => {
    const balanceSheetEntity = new BalanceSheetEntity(
      undefined,
      balanceSheetFactory.emptyFullV508(),
      [new User(undefined, 'test@example.com', 'test1234', Role.User)]
    );
    const savedResult = await balanceSheetEntityRepository.save(
      balanceSheetEntity
    );
    const result = await balanceSheetEntityRepository.findByIdOrFail(
      savedResult.id!
    );
    expect(result.users).toHaveLength(0);
  });

  async function cleanUpTables() {
    const balanceSheetEntityRepository = await dataSource.getRepository(
      BalanceSheetEntity
    );
    const balanceSheetEntities = await balanceSheetEntityRepository.find();
    for (const balanceSheetEntity of balanceSheetEntities) {
      await balanceSheetEntityRepository.delete({ id: balanceSheetEntity.id });
    }
  }

  it('does save relation to existing user', async () => {
    await cleanUpTables();
    const email = `${uuid4()}@example.com`;
    const user = await new UserEntityRepository(dataSource.manager).save(
      new User(undefined, email, 'test1234', Role.User)
    );
    const balanceSheetEntity = new BalanceSheetEntity(
      undefined,
      balanceSheetFactory.emptyFullV508(),
      [user]
    );
    const savedResult = await balanceSheetEntityRepository.save(
      balanceSheetEntity
    );
    const result = await balanceSheetEntityRepository.findByIdOrFail(
      savedResult.id!
    );

    expect(result.users).toHaveLength(1);
    expect(result.users[0]).toMatchObject({
      email,
      role: Role.User,
    });
    const relation = await dataSource.query(
      `SELECT * from balance_sheet_entities_users where "userId" = ${user.id} and "balanceSheetEntityId" = ${savedResult.id}`
    );
    expect(relation).toHaveLength(1);
    expect(relation[0]).toMatchObject({
      balanceSheetEntityId: savedResult.id,
      userId: user.id,
    });
  });

  it('loads organization relation', async () => {
    await cleanUpTables();
    const email = `${uuid4()}@example.com`;
    const user = await new UserEntityRepository(dataSource.manager).save(
      new User(undefined, email, 'test1234', Role.User)
    );
    const organizationRepo = new OrganizationEntityRepository(
      dataSource.manager
    );
    const organizationEntity = await organizationRepo.save(
      new OrganizationEntity(undefined, organizationFactory.default(), [user])
    );
    const balanceSheetEntity = new BalanceSheetEntity(
      undefined,
      balanceSheetFactory.emptyFullV508(),
      []
    );
    const savedResult = await balanceSheetEntityRepository.save(
      balanceSheetEntity
    );
    organizationEntity.addBalanceSheetEntity(balanceSheetEntity);
    await organizationRepo.save(organizationEntity);
    const result = await balanceSheetEntityRepository.findByIdOrFail(
      savedResult.id!
    );

    expect(result.users).toHaveLength(0);
    expect(result.organizationEntity?.id).toEqual(organizationEntity.id);
    expect(result.organizationEntity?.hasMemberWithEmail(email)).toBeTruthy();
  });

  it('fails if the value of balance sheet column is invalid', async () => {
    const email = `${uuid4()}@example.com`;
    const user = await dataSource
      .getRepository(User)
      .save(new User(undefined, email, 'test1234', Role.User));
    const balanceSheetEntity = await balanceSheetEntityRepository.save(
      new BalanceSheetEntity(undefined, balanceSheetFactory.emptyFullV508(), [
        user,
      ])
    );
    const balanceSheetJson = {
      ...balanceSheetEntity.toBalanceSheet(),
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
        balanceSheetEntity.toBalanceSheet()
      )}'::jsonb WHERE id = ${balanceSheetEntity.id};`
    );
  });
});
