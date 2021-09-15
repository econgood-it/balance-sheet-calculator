import { Connection, Repository } from 'typeorm';
import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import { ConfigurationReader } from '../../src/configuration.reader';
import { RegionProvider } from '../../src/providers/region.provider';
import { CompanyFacts } from '../../src/entities/companyFacts';
import { EmptyCompanyFacts } from '../testData/company.facts';
import { SupplyFraction } from '../../src/entities/supplyFraction';
import { Region } from '../../src/entities/region';
import { EmployeesFraction } from '../../src/entities/employeesFraction';

describe('Region Provider', () => {
  let connection: Connection;
  let companyFacts: CompanyFacts;
  let regionRepo: Repository<Region>;

  beforeAll(async () => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        ConfigurationReader.read()
      );
    regionRepo = await connection.getRepository(Region);
    companyFacts = EmptyCompanyFacts;
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should contain regions of supplyfractions', async () => {
    companyFacts.supplyFractions = [
      new SupplyFraction(undefined, 'A', 'CRI', 100),
      new SupplyFraction(undefined, 'B', 'DEU', 200),
    ];
    const regionProvider = await RegionProvider.createFromCompanyFacts(
      companyFacts,
      regionRepo
    );
    expect(regionProvider.getOrFail('CRI').countryCode).toBe('CRI');
    expect(regionProvider.getOrFail('DEU').countryCode).toBe('DEU');
  });

  it('should contain regions of employeesFraction', async () => {
    companyFacts.employeesFractions = [
      new EmployeesFraction(undefined, 'AFG', 3),
      new EmployeesFraction(undefined, 'CRI', 4),
    ];
    const regionProvider = await RegionProvider.createFromCompanyFacts(
      companyFacts,
      regionRepo
    );
    expect(regionProvider.getOrFail('CRI').countryCode).toBe('CRI');
    expect(regionProvider.getOrFail('AFG').countryCode).toBe('AFG');
  });

  it('should contain regions of mainOriginOfOtherSuppliers', async () => {
    companyFacts.mainOriginOfOtherSuppliers.countryCode = 'BRA';
    const regionProvider = await RegionProvider.createFromCompanyFacts(
      companyFacts,
      regionRepo
    );
    expect(regionProvider.getOrFail('BRA').countryCode).toBe('BRA');
  });
});
