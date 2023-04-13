import { DataSource, Repository } from 'typeorm';
import { DatabaseSourceCreator } from '../../src/databaseSourceCreator';
import { ConfigurationReader } from '../../src/configuration.reader';
import {
  ORGANIZATION_RELATIONS,
  OrganizationEntity,
} from '../../src/entities/organization.entity';
import { User } from '../../src/entities/user';
import { Role } from '../../src/entities/enums';
import { v4 as uuid4 } from 'uuid';
import {
  IOrganizationEntityRepo,
  OrganizationEntityRepository,
} from '../../src/repositories/organization.entity.repo';

describe('OrganizationEntityRepo', () => {
  let organizationEntityRepo: IOrganizationEntityRepo;
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
  });

  afterAll(async () => {
    await dataSource.destroy();
  });
  it('should be save', async () => {
    const user = await dataSource
      .getRepository(User)
      .save(
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
});
