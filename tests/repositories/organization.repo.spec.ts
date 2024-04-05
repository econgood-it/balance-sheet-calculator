import { DataSource } from 'typeorm';
import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import { ConfigurationReader } from '../../src/reader/configuration.reader';

import { v4 as uuid4 } from 'uuid';

import { Role } from '../../src/models/user';
import { makeOrganization } from '../../src/models/organization';
import {
  IOrganizationRepo,
  makeOrganizationRepository,
} from '../../src/repositories/organization.repo';

describe('OrganizationRepo', () => {
  let organizationRepo: IOrganizationRepo;
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      ConfigurationReader.read()
    );
    organizationRepo = makeOrganizationRepository(dataSource.manager);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });
  it('should be saved', async () => {
    const user = { id: uuid4() };
    const members = [user];
    const organization = makeOrganization().withFields({ members });

    const id = (await organizationRepo.save(organization)).id;

    const organizationFound = await organizationRepo.findByIdOrFail(id!);
    expect(organizationFound).toStrictEqual({ ...organization, id: id });
  });

  it('finds all organizations of user', async () => {
    const user = {
      email: `${uuid4()}@example.com`,
      id: uuid4(),
      role: Role.User,
    };

    const organization = await organizationRepo.save(
      makeOrganization().withFields({ members: [user] })
    );
    const organization2 = await organizationRepo.save(
      makeOrganization().withFields({ members: [user] })
    );

    const organizations = await organizationRepo.findOrganizationsOfUser(
      user.id!
    );
    expect(organizations.map((o) => o.id)).toEqual([
      organization.id,
      organization2.id,
    ]);
  });

  it('finds all organizations where user is invited', async () => {
    const email = `${uuid4()}@example.com`;
    const email2 = `${uuid4()}@example.com`;
    const otherEmail = `${uuid4()}@example.com`;
    const organization1 = await organizationRepo.save(
      makeOrganization().invite(email).invite(email2).invite(otherEmail)
    );
    const organization2 = await organizationRepo.save(
      makeOrganization().invite(email)
    );
    const organization3 = await organizationRepo.save(
      makeOrganization().invite(email2)
    );
    await organizationRepo.save(makeOrganization());

    const organizations1 =
      await organizationRepo.findOrganizationsWithInvitation(email);
    expect(organizations1.map((o) => o.id)).toEqual([
      organization1.id,
      organization2.id,
    ]);

    const organizations2 =
      await organizationRepo.findOrganizationsWithInvitation(email2);
    expect(organizations2.map((o) => o.id)).toEqual([
      organization1.id,
      organization3.id,
    ]);
  });

  // it('saves and finds all balance sheet entities of organization', async () => {
  //   const { organizationEntity } = await new OrganizationBuilder()
  //     .addMember()
  //     .addBalanceSheetEntity()
  //     .addBalanceSheetEntity()
  //     .build(dataSource);
  //
  //   const foundOrganizationEntity = await organizationRepo.findByIdOrFail(
  //     organizationEntity.id!,
  //     true
  //   );
  //   expect(organizationEntity.balanceSheetEntities).toBeDefined();
  //   organizationEntity.balanceSheetEntities?.forEach((b) =>
  //     expect(b.id).toBeDefined()
  //   );
  //   expect(
  //     foundOrganizationEntity.balanceSheetEntities?.map((b) => b.id)
  //   ).toEqual(organizationEntity.balanceSheetEntities?.map((b) => b.id));
  // });
});
