import { DataSource } from 'typeorm';
import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import { ConfigurationReader } from '../../src/reader/configuration.reader';
import { OrganizationEntity } from '../../src/entities/organization.entity';

import { v4 as uuid4 } from 'uuid';
import {
  IOrganizationEntityRepo,
  OrganizationEntityRepository,
} from '../../src/repositories/organization.entity.repo';

import { OrganizationBuilder } from '../OrganizationBuilder';
import { Role } from '../../src/models/user';

describe('OrganizationEntityRepo', () => {
  let organizationEntityRepo: IOrganizationEntityRepo;
  let dataSource: DataSource;
  const organization = {
    name: 'My organization',
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
  });

  afterAll(async () => {
    await dataSource.destroy();
  });
  it('should be save', async () => {
    const user = { id: `${uuid4()}@example.com` };

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

  it('does remove organization ', async () => {
    const { organizationEntity } = await new OrganizationBuilder()
      .addMember()
      .build(dataSource);
    const baseOrgaRepo = dataSource.getRepository(OrganizationEntity);
    const findPredicate = { id: organizationEntity.id };
    expect(await baseOrgaRepo.findOneBy(findPredicate)).toBeDefined();

    await organizationEntityRepo.remove(organizationEntity);
    expect(await baseOrgaRepo.findOneBy(findPredicate)).toBeNull();
  });

  it('finds all organizations of user', async () => {
    const user = {
      email: `${uuid4()}@example.com`,
      id: 'test1234',
      role: Role.User,
    };

    const { organizationEntity: organizationEntity1 } =
      await new OrganizationBuilder().addMember(user).build(dataSource);
    const { organizationEntity: organizationEntity2 } =
      await new OrganizationBuilder().addMember(user).build(dataSource);

    const organizations = await organizationEntityRepo.findOrganizationsOfUser(
      user.email!
    );
    expect(organizations.map((o) => o.id)).toEqual([
      organizationEntity1.id,
      organizationEntity2.id,
    ]);
  });

  it('saves and finds all balance sheet entities of organization', async () => {
    const { organizationEntity } = await new OrganizationBuilder()
      .addMember()
      .addBalanceSheetEntity()
      .addBalanceSheetEntity()
      .build(dataSource);

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
