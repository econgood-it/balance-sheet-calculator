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
import { OrganizationBuilder } from '../OrganizationBuilder';

describe('OrganizationEntityRepo', () => {
  let organizationEntityRepo: IOrganizationEntityRepo;
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
    const { organizationEntity } = await new OrganizationBuilder(dataSource)
      .addMember()
      .build();

    const query = `SELECT * from organization_members where "userId" = ${organizationEntity.members[0].id} and "organizationEntityId" = ${organizationEntity.id}`;
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

    const { organizationEntity: organizationEntity1 } =
      await new OrganizationBuilder(dataSource).addMember(user).build();
    const { organizationEntity: organizationEntity2 } =
      await new OrganizationBuilder(dataSource).addMember(user).build();

    const organizations = await organizationEntityRepo.findOrganizationsOfUser(
      user.id!
    );
    expect(organizations.map((o) => o.id)).toEqual([
      organizationEntity1.id,
      organizationEntity2.id,
    ]);
  });

  it('saves and finds all balance sheet entities of organization', async () => {
    const { organizationEntity } = await new OrganizationBuilder(dataSource)
      .addMember()
      .addBalanceSheetEntity()
      .addBalanceSheetEntity()
      .build();

    const foundOrganizationEntity = await organizationEntityRepo.findByIdOrFail(
      organizationEntity.id!,
      true
    );
    expect(organizationEntity.balanceSheetEntities).toBeDefined();
    organizationEntity.balanceSheetEntities?.forEach((b) =>
      expect(b.id).toBeDefined()
    );
    expect(
      foundOrganizationEntity.balanceSheetEntities?.map((b) => b.id)
    ).toEqual(organizationEntity.balanceSheetEntities?.map((b) => b.id));
  });
});
