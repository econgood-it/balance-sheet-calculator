import { DataSource } from 'typeorm';
import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import {
  OrganizationDBSchema,
  OrganizationEntity,
} from '../../src/entities/organization.entity';
import { ConfigurationReader } from '../../src/reader/configuration.reader';

import { v4 as uuid4 } from 'uuid';
import {
  IOldOrganizationEntityRepo,
  OldOrganizationEntityRepository,
} from '../../src/repositories/oldOrganization.entity.repo';

import { Role } from '../../src/models/user';
import { OrganizationBuilder } from '../OrganizationBuilder';

describe('OrganizationEntityRepo', () => {
  let organizationEntityRepo: IOldOrganizationEntityRepo;
  let dataSource: DataSource;
  const organization = {
    name: 'My organization',
    address: {
      street: 'Example street',
      houseNumber: '28s',
      city: 'Example city',
      zip: '999999',
    },
    invitations: [`${uuid4()}@example.com`, `${uuid4()}@example.com`],
  };

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      ConfigurationReader.read()
    );
    organizationEntityRepo = new OldOrganizationEntityRepository(
      dataSource.manager
    );
  });

  afterAll(async () => {
    await dataSource.destroy();
  });
  it('should be save', async () => {
    const user = { id: uuid4() };

    const members = [user];

    const organizationEntity = new OrganizationEntity(
      undefined,
      OrganizationDBSchema.parse(organization),
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
      id: uuid4(),
      role: Role.User,
    };

    const { organizationEntity: organizationEntity1 } =
      await new OrganizationBuilder().addMember(user).build(dataSource);
    const { organizationEntity: organizationEntity2 } =
      await new OrganizationBuilder().addMember(user).build(dataSource);

    const organizations = await organizationEntityRepo.findOrganizationsOfUser(
      user.id!
    );
    expect(organizations.map((o) => o.id)).toEqual([
      organizationEntity1.id,
      organizationEntity2.id,
    ]);
  });

  it('finds all organizations where user is invited', async () => {
    const email = `${uuid4()}@example.com`;
    const email2 = `${uuid4()}@example.com`;
    const otherEmail = `${uuid4()}@example.com`;
    const { organizationEntity: organizationEntity1 } =
      await new OrganizationBuilder()
        .inviteMember(email)
        .inviteMember(otherEmail)
        .inviteMember(email2)
        .build(dataSource);
    const { organizationEntity: organizationEntity2 } =
      await new OrganizationBuilder().inviteMember(email).build(dataSource);

    const { organizationEntity: organizationEntity3 } =
      await new OrganizationBuilder().inviteMember(email2).build(dataSource);
    await new OrganizationBuilder().build(dataSource);

    const organizations1 =
      await organizationEntityRepo.findOrganizationsWithInvitation(email);
    expect(organizations1.map((o) => o.id)).toEqual([
      organizationEntity1.id,
      organizationEntity2.id,
    ]);

    const organizations2 =
      await organizationEntityRepo.findOrganizationsWithInvitation(email2);
    expect(organizations2.map((o) => o.id)).toEqual([
      organizationEntity1.id,
      organizationEntity3.id,
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
