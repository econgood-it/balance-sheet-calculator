import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import { DataSource } from 'typeorm';
import { ConfigurationReader } from '../../src/configuration.reader';
import { BalanceSheetEntity } from '../../src/entities/balance.sheet.entity';
import { Role } from '../../src/entities/enums';
import { User } from '../../src/entities/user';
import { balanceSheetFactory } from '../../src/openapi/examples';
import { v4 as uuid4 } from 'uuid';
import {
  BalanceSheetEntityRepository,
  IBalanceSheetEntityRepo,
} from '../../src/repositories/balance.sheet.entity.repo';

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
      balanceSheetFactory.emptyV508(),
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
    const user = await dataSource
      .getRepository(User)
      .save(new User(undefined, email, 'test1234', Role.User));
    const balanceSheetEntity = new BalanceSheetEntity(
      undefined,
      balanceSheetFactory.emptyV508(),
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

  it('does remove relation to user on delete', async () => {
    await cleanUpTables();
    const email = `${uuid4()}@example.com`;
    const user = await dataSource
      .getRepository(User)
      .save(new User(undefined, email, 'test1234', Role.User));
    const balanceSheetEntity = await balanceSheetEntityRepository.save(
      new BalanceSheetEntity(undefined, balanceSheetFactory.emptyV508(), [user])
    );
    const query = `SELECT * from balance_sheet_entities_users where "userId" = ${user.id} and "balanceSheetEntityId" = ${balanceSheetEntity.id}`;
    let relation = await dataSource.query(query);
    expect(relation).toHaveLength(1);
    await balanceSheetEntityRepository.remove(balanceSheetEntity);
    relation = await dataSource.query(query);
    expect(relation).toHaveLength(0);
  });
});
