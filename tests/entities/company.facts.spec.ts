import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import { Connection, Repository } from 'typeorm';
import { ConfigurationReader } from '../../src/configuration.reader';
import { CompanyFacts } from '../../src/entities/companyFacts';
import { EmptyCompanyFacts } from '../testData/company.facts';
import { MainOriginOfOtherSuppliers } from '../../src/entities/main.origin.of.other.suppliers';
import { EmployeesFraction } from '../../src/entities/employeesFraction';
import { SupplyFraction } from '../../src/entities/supplyFraction';

describe('Company Facts entity', () => {
  let companyFactsRepository: Repository<CompanyFacts>;
  let connection: Connection;

  beforeAll(async () => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        ConfigurationReader.read()
      );
    companyFactsRepository = connection.getRepository(CompanyFacts);
  });

  afterAll(async () => {
    await connection.close();
  });

  describe('is saved and has the property ', () => {
    let companyFacts: CompanyFacts;
    beforeEach(() => {
      companyFacts = EmptyCompanyFacts;
    });

    it('profit', async () => {
      companyFacts.profit = 200;
      const result = await companyFactsRepository.save(companyFacts);
      expect(result.profit).toBe(200);
      await companyFactsRepository.remove(result);
    });

    it('mainOriginOfOtherSuppliers', async () => {
      const companyFactsWithNonDefaultMainOriginOfOtherSuppliers =
        new CompanyFacts(
          undefined,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          false,
          0,
          false,
          [],
          [],
          [],
          new MainOriginOfOtherSuppliers(undefined, 'DEU', 200)
        );
      const result = await companyFactsRepository.save(
        companyFactsWithNonDefaultMainOriginOfOtherSuppliers
      );
      expect(result.mainOriginOfOtherSuppliers).toMatchObject({
        countryCode: 'DEU',
        costs: 200,
      });
      await companyFactsRepository.remove(result);
    });

    it('financialAssetsAndCashBalance', async () => {
      companyFacts.financialAssetsAndCashBalance = 300;
      const result = await companyFactsRepository.save(companyFacts);
      expect(result.financialAssetsAndCashBalance).toBe(300);
      await companyFactsRepository.remove(result);
    });

    it('numberOfEmployees', async () => {
      companyFacts.numberOfEmployees = 300;
      const result = await companyFactsRepository.save(companyFacts);
      expect(result.numberOfEmployees).toBe(300);
      await companyFactsRepository.remove(result);
    });

    it('hasCanteen', async () => {
      companyFacts.hasCanteen = true;
      const result = await companyFactsRepository.save(companyFacts);
      expect(result.hasCanteen).toBeTruthy();
      await companyFactsRepository.remove(result);
    });

    it('averageJourneyToWorkForStaffInKm', async () => {
      companyFacts.averageJourneyToWorkForStaffInKm = 200;
      const result = await companyFactsRepository.save(companyFacts);
      expect(result.averageJourneyToWorkForStaffInKm).toBeCloseTo(200);
      await companyFactsRepository.remove(result);
    });

    it('isB2B', async () => {
      companyFacts.isB2B = true;
      const result = await companyFactsRepository.save(companyFacts);
      expect(result.isB2B).toBeTruthy();
      await companyFactsRepository.remove(result);
    });
  });

  it('should return all countryCodes', async () => {
    const companyFacts = new CompanyFacts(
      undefined,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      false,
      0,
      false,
      [
        new SupplyFraction(undefined, 'A', 'CRI', 100),
        new SupplyFraction(undefined, 'B', 'DEU', 200),
      ],
      [
        new EmployeesFraction(undefined, 'AFG', 3),
        new EmployeesFraction(undefined, 'CRI', 4),
        new EmployeesFraction(undefined, 'DEU', 4),
      ],
      [],
      new MainOriginOfOtherSuppliers(undefined, 'BRA', 200)
    );
    let result = companyFacts.getAllCountryCodes();
    expect(result).toEqual(['CRI', 'DEU', 'AFG', 'CRI', 'DEU', 'BRA']);
    // Without duplicates
    result = companyFacts.getAllCountryCodes(true);
    expect(result).toEqual(['CRI', 'DEU', 'AFG', 'BRA']);
  });
});
