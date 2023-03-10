import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import { Connection, Repository } from 'typeorm';
import { ConfigurationReader } from '../../src/configuration.reader';
import {
  BALANCE_SHEET_RELATIONS,
  BalanceSheetEntity,
  createFromBalanceSheet,
} from '../../src/entities/balance.sheet.entity';
import { Role } from '../../src/entities/enums';
import { User } from '../../src/entities/user';
import { balanceSheetFactory } from '../../src/openapi/examples';

describe('Balance Sheet', () => {
  let balanceSheetEntityRepository: Repository<BalanceSheetEntity>;
  let connection: Connection;

  beforeAll(async () => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        ConfigurationReader.read()
      );
    balanceSheetEntityRepository = connection.getRepository(BalanceSheetEntity);
  });

  afterAll(async () => {
    await connection.close();
  });

  it(' does not cascades users on insert', async () => {
    const balanceSheetEntity = createFromBalanceSheet(
      undefined,
      balanceSheetFactory.emptyV508(),
      [new User(undefined, 'test@example.com', 'test1234', Role.User)]
    );
    const savedResult = await balanceSheetEntityRepository.save(
      balanceSheetEntity
    );
    const result = await balanceSheetEntityRepository.findOneOrFail({
      where: { id: savedResult.id },
      relations: BALANCE_SHEET_RELATIONS,
    });
    expect(result.users).toHaveLength(0);
  });

  async function cleanUpTables() {
    const balanceSheetEntityRepository = await connection.getRepository(
      BalanceSheetEntity
    );
    const balanceSheetEntities = await balanceSheetEntityRepository.find();
    for (const balanceSheetEntity of balanceSheetEntities) {
      await balanceSheetEntityRepository.delete({ id: balanceSheetEntity.id });
    }
    const userRepository = await connection.getRepository(User);
    const users = await userRepository.find();
    for (const user of users) {
      await userRepository.delete({ id: user.id });
    }
  }

  it(' does save relation to existing user', async () => {
    await cleanUpTables();
    const user = await connection
      .getRepository(User)
      .save(new User(undefined, 'u@example.com', 'test1234', Role.User));
    const balanceSheetEntity = createFromBalanceSheet(
      undefined,
      balanceSheetFactory.emptyV508(),
      [user]
    );
    const savedResult = await balanceSheetEntityRepository.save(
      balanceSheetEntity
    );
    const result = await balanceSheetEntityRepository.findOneOrFail({
      where: { id: savedResult.id },
      relations: BALANCE_SHEET_RELATIONS,
    });

    expect(result.users).toHaveLength(1);
    expect(result.users[0]).toMatchObject({
      email: 'u@example.com',
      role: Role.User,
    });
    const relation = await connection.query(
      `SELECT * from balance_sheet_entities_users where "userId" = ${user.id} and "balanceSheetEntityId" = ${balanceSheetEntity.id}`
    );
    expect(relation).toHaveLength(1);
    expect(relation[0]).toMatchObject({
      balanceSheetEntityId: balanceSheetEntity.id,
      userId: user.id,
    });
    await connection.getRepository(User).remove(user);
  });

  it(' does remove relation to user on delete', async () => {
    await cleanUpTables();
    const email = 'u2@example.com';
    await connection.getRepository(User).delete({ email });
    const user = await connection
      .getRepository(User)
      .save(new User(undefined, email, 'test1234', Role.User));
    const balanceSheetEntity = createFromBalanceSheet(
      undefined,
      balanceSheetFactory.emptyV508(),
      [user]
    );

    await balanceSheetEntityRepository.save(balanceSheetEntity);
    const query = `SELECT * from balance_sheet_entities_users where "userId" = ${user.id} and "balanceSheetEntityId" = ${balanceSheetEntity.id}`;
    let relation = await connection.query(query);
    expect(relation).toHaveLength(1);
    await balanceSheetEntityRepository.remove(balanceSheetEntity);
    relation = await connection.query(query);
    expect(relation).toHaveLength(0);
    await connection.getRepository(User).remove(user);
  });
});
