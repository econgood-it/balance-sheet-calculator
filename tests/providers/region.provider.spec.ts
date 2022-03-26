import { Connection, Repository } from 'typeorm';
import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import { ConfigurationReader } from '../../src/configuration.reader';
import { RegionProvider } from '../../src/providers/region.provider';
import { CompanyFacts } from '../../src/entities/companyFacts';
import { EmptyCompanyFacts } from '../testData/company.facts';
import { SupplyFraction } from '../../src/entities/supplyFraction';
import { Region } from '../../src/entities/region';
import { EmployeesFraction } from '../../src/entities/employeesFraction';
import { BalanceSheetVersion } from '../../src/entities/enums';

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
      regionRepo,
      BalanceSheetVersion.v5_0_4
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
      regionRepo,
      BalanceSheetVersion.v5_0_4
    );
    expect(regionProvider.getOrFail('CRI').countryCode).toBe('CRI');
    expect(regionProvider.getOrFail('AFG').countryCode).toBe('AFG');
  });

  it('should contain regions of mainOriginOfOtherSuppliers', async () => {
    companyFacts.mainOriginOfOtherSuppliers.countryCode = 'BRA';
    const regionProvider = await RegionProvider.createFromCompanyFacts(
      companyFacts,
      regionRepo,
      BalanceSheetVersion.v5_0_4
    );
    expect(regionProvider.getOrFail('BRA').countryCode).toBe('BRA');
  });

  it('should contain regions of supplyfractions for version 5.06', async () => {
    companyFacts.supplyFractions = [
      new SupplyFraction(undefined, 'A', 'CRI', 100),
      new SupplyFraction(undefined, 'B', 'DEU', 200),
    ];
    const regionProvider = await RegionProvider.createFromCompanyFacts(
      companyFacts,
      regionRepo,
      BalanceSheetVersion.v5_0_6
    );
    expect(regionProvider.getOrFail('DEU')).toMatchObject({
      countryCode: 'DEU',
      validFromVersion: BalanceSheetVersion.v5_0_5,
    });
  });

  it('should contain regions of employeesFraction for version 5.06', async () => {
    companyFacts.employeesFractions = [
      new EmployeesFraction(undefined, 'AFG', 3),
      new EmployeesFraction(undefined, 'CRI', 4),
    ];
    const regionProvider = await RegionProvider.createFromCompanyFacts(
      companyFacts,
      regionRepo,
      BalanceSheetVersion.v5_0_6
    );
    expect(regionProvider.getOrFail('CRI')).toMatchObject({
      countryCode: 'CRI',
      validFromVersion: BalanceSheetVersion.v5_0_5,
    });
    expect(regionProvider.getOrFail('AFG')).toMatchObject({
      countryCode: 'AFG',
      validFromVersion: BalanceSheetVersion.v5_0_5,
    });
  });

  it('should contain regions of mainOriginOfOtherSuppliers for version 5.06', async () => {
    companyFacts.mainOriginOfOtherSuppliers.countryCode = 'BRA';
    const regionProvider = await RegionProvider.createFromCompanyFacts(
      companyFacts,
      regionRepo,
      BalanceSheetVersion.v5_0_6
    );
    expect(regionProvider.getOrFail('BRA')).toMatchObject({
      countryCode: 'BRA',
      validFromVersion: BalanceSheetVersion.v5_0_5,
    });
  });

  it('should return validFromVersion corresponding to given balance sheet version', async () => {
    let result = await RegionProvider.findCorrectValidFromVersion(
      BalanceSheetVersion.v5_0_6,
      regionRepo
    );
    expect(result).toBe(BalanceSheetVersion.v5_0_5);
    result = await RegionProvider.findCorrectValidFromVersion(
      BalanceSheetVersion.v5_0_4,
      regionRepo
    );
    expect(result).toBe(BalanceSheetVersion.v5_0_4);
  });
});
