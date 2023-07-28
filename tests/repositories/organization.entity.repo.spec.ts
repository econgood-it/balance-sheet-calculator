import { DataSource } from 'typeorm';
import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import { ConfigurationReader } from '../../src/reader/configuration.reader';
import { OrganizationEntity } from '../../src/entities/organization.entity';
import { User } from '../../src/entities/user';
import { Role } from '../../src/entities/enums';
import { v4 as uuid4 } from 'uuid';
import {
  IOrganizationEntityRepo,
  OrganizationEntityRepository,
} from '../../src/repositories/organization.entity.repo';
import {
  IUserEntityRepo,
  UserEntityRepository,
} from '../../src/repositories/user.entity.repo';
import { BalanceSheetEntity } from '../../src/entities/balance.sheet.entity';
import {
  BalanceSheetEntityRepository,
  IBalanceSheetEntityRepo,
} from '../../src/repositories/balance.sheet.entity.repo';
import { balanceSheetFactory } from '../../src/openapi/examples';

describe('OrganizationEntityRepo', () => {
  let organizationEntityRepo: IOrganizationEntityRepo;
  let balanceSheetEntityRepo: IBalanceSheetEntityRepo;
  let userEntityRepo: IUserEntityRepo;
  let dataSource: DataSource;
  const organization = {
    address: {
      street: 'Example street',
      houseNumber: '28s',
      city: 'Example city',
      zip: '999999',
    },
  };

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      ConfigurationReader.read()
    );
    organizationEntityRepo = new OrganizationEntityRepository(
      dataSource.manager
    );
    balanceSheetEntityRepo = new BalanceSheetEntityRepository(
      dataSource.manager
    );
    userEntityRepo = new UserEntityRepository(dataSource.manager);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });
  it('should be save', async () => {
    const user = await userEntityRepo.save(
      new User(undefined, `${uuid4()}@example.com`, 'test1234', Role.User)
    );
    const members = [user];

    const organizationEntity = new OrganizationEntity(
      undefined,
      organization,
      members
    );
    const id = (await organizationEntityRepo.save(organizationEntity)).id;

    const organizationEnityFound = await organizationEntityRepo.findByIdOrFail(
      id!
    );
    expect(organizationEnityFound.organization).toStrictEqual(organization);
    expect(organizationEnityFound.members).toStrictEqual(members);
  });

  it('does not cascades members on insert', async () => {
    const organizationEntity = new OrganizationEntity(undefined, organization, [
      new User(undefined, `${uuid4()}@example.com`, 'test1234', Role.User),
    ]);
    const id = (await organizationEntityRepo.save(organizationEntity)).id;
    const organizationEntityFound = await organizationEntityRepo.findByIdOrFail(
      id!
    );
    expect(organizationEntityFound.members).toHaveLength(0);
  });

  it('does remove relation to member on organization delete', async () => {
    const email = `${uuid4()}@example.com`;
    const user = await dataSource
      .getRepository(User)
      .save(new User(undefined, email, 'test1234', Role.User));
    const organizationEntity = await organizationEntityRepo.save(
      new OrganizationEntity(undefined, organization, [user])
    );

    const query = `SELECT * from organization_members where "userId" = ${user.id} and "organizationEntityId" = ${organizationEntity.id}`;
    let relation = await dataSource.query(query);
    expect(relation).toHaveLength(1);
    await organizationEntityRepo.remove(organizationEntity);
    relation = await dataSource.query(query);
    expect(relation).toHaveLength(0);
  });

  it('finds all organizations of user', async () => {
    const user = await userEntityRepo.save(
      new User(undefined, `${uuid4()}@example.com`, 'test1234', Role.User)
    );
    const members = [user];

    const organizationEntity = new OrganizationEntity(
      undefined,
      organization,
      members
    );
    const id1 = (await organizationEntityRepo.save(organizationEntity)).id;
    const organizationEntity2 = new OrganizationEntity(
      undefined,
      organization,
      members
    );
    const id2 = (await organizationEntityRepo.save(organizationEntity2)).id;

    const organizations = await organizationEntityRepo.findOrganizationsOfUser(
      user.id!
    );
    expect(organizations.map((o) => o.id)).toEqual([id1, id2]);
  });

  it('saves and finds all balance sheet entities of organization', async () => {
    const user = await userEntityRepo.save(
      new User(undefined, `${uuid4()}@example.com`, 'test1234', Role.User)
    );
    const members = [user];

    const organizationEntity = new OrganizationEntity(
      undefined,
      organization,
      members
    );
    const balanceSheetEntities = [
      new BalanceSheetEntity(undefined, balanceSheetFactory.emptyFullV508(), [
        user,
      ]),
      new BalanceSheetEntity(undefined, balanceSheetFactory.emptyFullV508(), [
        user,
      ]),
    ];
    const savedBalanceSheetEntities = await Promise.all(
      balanceSheetEntities.map(
        async (b) => await balanceSheetEntityRepo.save(b)
      )
    );
    savedBalanceSheetEntities.map((b) =>
      organizationEntity.addBalanceSheetEntity(b)
    );
    const orgaId = (await organizationEntityRepo.save(organizationEntity)).id;
    const foundOrganizationEntity = await organizationEntityRepo.findByIdOrFail(
      orgaId!,
      true
    );
    expect(
      foundOrganizationEntity.balanceSheetEntities?.map((b) => b.id)
    ).toEqual(savedBalanceSheetEntities.map((b) => b.id));
  });
});
