import { Connection, Repository } from 'typeorm';
import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import { ConfigurationReader } from '../../src/configuration.reader';
import { OrganizationEntity } from '../../src/entities/organization.entity';

describe('CompanyProfileEntity', () => {
  let organizationEntityRepo: Repository<OrganizationEntity>;
  let connection: Connection;

  beforeAll(async () => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        ConfigurationReader.read()
      );
    organizationEntityRepo = connection.getRepository(OrganizationEntity);
  });

  afterAll(async () => {
    await connection.close();
  });
  it('should be saved', async () => {
    const organization = {
      address: {
        street: 'Example street',
        houseNumber: '28s',
        city: 'Example city',
        zip: '999999',
      },
    };

    const organizationEntity = new OrganizationEntity(undefined, organization);
    const id = (await organizationEntityRepo.save(organizationEntity)).id;
    const organizationEnityFound = await organizationEntityRepo.findOneByOrFail(
      {
        id: id,
      }
    );
    expect(organizationEnityFound.organization).toStrictEqual(organization);
  });
});
