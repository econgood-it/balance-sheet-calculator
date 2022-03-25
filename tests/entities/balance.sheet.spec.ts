import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import { Connection, Repository } from 'typeorm';
import { ConfigurationReader } from '../../src/configuration.reader';
import {
  BALANCE_SHEET_RELATIONS,
  BalanceSheet,
} from '../../src/entities/balanceSheet';
import {
  BalanceSheetType,
  BalanceSheetVersion,
  Role,
} from '../../src/entities/enums';
import { EmptyCompanyFactsJson } from '../testData/company.facts';
import { RatingsFactory } from '../../src/factories/ratings.factory';
import { User } from '../../src/entities/user';
import { CompanyFactsDTOCreate } from '../../src/dto/create/company.facts.create.dto';

describe('Balance Sheet', () => {
  let balanceSheetRepository: Repository<BalanceSheet>;
  let connection: Connection;

  beforeAll(async () => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        ConfigurationReader.read()
      );
    balanceSheetRepository = connection.getRepository(BalanceSheet);
  });

  afterAll(async () => {
    await connection.close();
  });

  it(' does not cascades users on insert', async () => {
    const balanceSheet = new BalanceSheet(
      undefined,
      BalanceSheetType.Full,
      BalanceSheetVersion.v5_0_6,
      CompanyFactsDTOCreate.fromJSON(EmptyCompanyFactsJson).toCompanyFacts(
        'en'
      ),
      await RatingsFactory.createDefaultRatings(
        BalanceSheetType.Full,
        BalanceSheetVersion.v5_0_6
      ),
      [new User(undefined, 'test@example.com', 'test1234', Role.User)]
    );
    const savedResult = await balanceSheetRepository.save(balanceSheet);
    const result = await balanceSheetRepository.findOneOrFail(savedResult.id, {
      relations: BALANCE_SHEET_RELATIONS,
    });
    expect(result.users).toHaveLength(0);
  });

  it(' does save relation to existing user', async () => {
    const user = await connection
      .getRepository(User)
      .save(new User(undefined, 'u@example.com', 'test1234', Role.User));
    const balanceSheet = new BalanceSheet(
      undefined,
      BalanceSheetType.Full,
      BalanceSheetVersion.v5_0_6,
      CompanyFactsDTOCreate.fromJSON(EmptyCompanyFactsJson).toCompanyFacts(
        'en'
      ),
      await RatingsFactory.createDefaultRatings(
        BalanceSheetType.Full,
        BalanceSheetVersion.v5_0_6
      ),
      [user]
    );
    const savedResult = await balanceSheetRepository.save(balanceSheet);
    const result = await balanceSheetRepository.findOneOrFail(savedResult.id, {
      relations: BALANCE_SHEET_RELATIONS,
    });

    expect(result.users).toHaveLength(1);
    expect(result.users[0]).toMatchObject({
      email: 'u@example.com',
      role: Role.User,
    });
    const relation = await connection.query(
      `SELECT * from balance_sheets_users where "userId" = ${user.id} and "balanceSheetId" = ${balanceSheet.id}`
    );
    expect(relation).toHaveLength(1);
    expect(relation[0]).toMatchObject({
      balanceSheetId: balanceSheet.id,
      userId: user.id,
    });
    await connection.getRepository(User).remove(user);
  });

  it(' does remove relation to user on delete', async () => {
    const user = await connection
      .getRepository(User)
      .save(new User(undefined, 'u2@example.com', 'test1234', Role.User));
    const balanceSheet = new BalanceSheet(
      undefined,
      BalanceSheetType.Full,
      BalanceSheetVersion.v5_0_4,
      CompanyFactsDTOCreate.fromJSON(EmptyCompanyFactsJson).toCompanyFacts(
        'en'
      ),
      await RatingsFactory.createDefaultRatings(
        BalanceSheetType.Full,
        BalanceSheetVersion.v5_0_4
      ),
      [user]
    );

    await balanceSheetRepository.save(balanceSheet);
    const query = `SELECT * from balance_sheets_users where "userId" = ${user.id} and "balanceSheetId" = ${balanceSheet.id}`;
    let relation = await connection.query(query);
    expect(relation).toHaveLength(1);
    await balanceSheetRepository.remove(balanceSheet);
    relation = await connection.query(query);
    expect(relation).toHaveLength(0);
    await connection.getRepository(User).remove(user);
  });
});
