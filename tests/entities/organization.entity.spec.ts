import { Connection, Repository } from 'typeorm';
import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import { ConfigurationReader } from '../../src/configuration.reader';
import {
  createFromOrganizationRequest,
  OrganizationEntity,
} from '../../src/entities/organization.entity';

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
    const street = 'Example street';
    const houseNumber = '28s';
    const zip = '999999';
    const city = 'Example city';
    const organizationEntity = new OrganizationEntity(
      undefined,
      street,
      houseNumber,
      zip,
      city
    );
    const id = (await organizationEntityRepo.save(organizationEntity)).id;
    const organization = await organizationEntityRepo.findOneByOrFail({
      id: id,
    });
    expect(organization.street).toBe(street);
    expect(organization.houseNumber).toBe(houseNumber);
    expect(organization.zip).toBe(zip);
    expect(organization.city).toBe(city);
  });

  it('should be created from organization request', async () => {
    const organizationRequest = {
      address: {
        street: 'Example street',
        houseNumber: '28a',
        city: 'Example city',
        zip: '999999',
      },
    };
    const organization = createFromOrganizationRequest(organizationRequest);
    expect(organization.street).toBe(organizationRequest.address.street);
    expect(organization.houseNumber).toBe(
      organizationRequest.address.houseNumber
    );
    expect(organization.zip).toBe(organizationRequest.address.zip);
    expect(organization.city).toBe(organizationRequest.address.city);
  });
});
