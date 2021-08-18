import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import { Connection } from 'typeorm';
import { ConfigurationReader } from '../../src/configuration.reader';
import { IndustrySector } from '../../src/entities/industry.sector';
import { CompanyFacts } from '../../src/entities/companyFacts';
import { EmptyCompanyFacts } from '../testData/company.facts';
import { EntityWithDtoMerger } from '../../src/merge/entity.with.dto.merger';
import { SupplyFraction } from '../../src/entities/supplyFraction';
import { EmployeesFraction } from '../../src/entities/employeesFraction';
import { CompanyFactsDTOUpdate } from '../../src/dto/update/company.facts.update.dto';

describe('EntityWithDTOMerger', () => {
  let connection: Connection;
  let companyFacts: CompanyFacts;
  let entityWithDtoMerger: EntityWithDtoMerger;

  beforeAll(async () => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        ConfigurationReader.read()
      );
    entityWithDtoMerger = new EntityWithDtoMerger(
      connection.getRepository(SupplyFraction),
      connection.getRepository(EmployeesFraction),
      connection.getRepository(IndustrySector)
    );
  });

  beforeEach(() => {
    companyFacts = EmptyCompanyFacts;
  });

  afterAll(async () => {
    await connection.close();
  });

  describe('should merge companyFacts', () => {
    const merge = async (json: any) =>
      await entityWithDtoMerger.mergeCompanyFacts(
        companyFacts,
        CompanyFactsDTOUpdate.fromJSON(json),
        'en'
      );

    it('using profit from db', async () => {
      companyFacts.profit = 200;
      await merge({});
      expect(companyFacts.profit).toBeCloseTo(200);
    });

    it('using profit from dto', async () => {
      companyFacts.profit = 200;
      await merge({ profit: 300 });
      expect(companyFacts.profit).toBeCloseTo(300);
    });

    it('using totalPurchaseFromSuppliers from db', async () => {
      companyFacts.totalPurchaseFromSuppliers = 200;
      await merge({});
      expect(companyFacts.totalPurchaseFromSuppliers).toBeCloseTo(200);
    });

    it('using totalPurchaseFromSuppliers from dto', async () => {
      companyFacts.totalPurchaseFromSuppliers = 200;
      await merge({ totalPurchaseFromSuppliers: 300 });
      expect(companyFacts.totalPurchaseFromSuppliers).toBeCloseTo(300);
    });

    it('using totalStaffCosts from db', async () => {
      companyFacts.totalStaffCosts = 200;
      await merge({});
      expect(companyFacts.totalStaffCosts).toBeCloseTo(200);
    });

    it('using totalStaffCosts from dto', async () => {
      companyFacts.totalStaffCosts = 200;
      await merge({ totalStaffCosts: 300 });
      expect(companyFacts.totalStaffCosts).toBeCloseTo(300);
    });

    it('using financialCosts from db', async () => {
      companyFacts.financialCosts = 200;
      await merge({});
      expect(companyFacts.financialCosts).toBeCloseTo(200);
    });

    it('using financialCosts from dto', async () => {
      companyFacts.financialCosts = 200;
      await merge({ financialCosts: 300 });
      expect(companyFacts.financialCosts).toBeCloseTo(300);
    });

    it('using incomeFromFinancialInvestments from db', async () => {
      companyFacts.incomeFromFinancialInvestments = 200;
      await merge({});
      expect(companyFacts.incomeFromFinancialInvestments).toBeCloseTo(200);
    });

    it('using incomeFromFinancialInvestments from dto', async () => {
      companyFacts.incomeFromFinancialInvestments = 200;
      await merge({ incomeFromFinancialInvestments: 300 });
      expect(companyFacts.incomeFromFinancialInvestments).toBeCloseTo(300);
    });

    it('using additionsToFixedAssets from db', async () => {
      companyFacts.additionsToFixedAssets = 200;
      await merge({});
      expect(companyFacts.additionsToFixedAssets).toBeCloseTo(200);
    });

    it('using additionsToFixedAssets from dto', async () => {
      companyFacts.additionsToFixedAssets = 200;
      await merge({ additionsToFixedAssets: 300 });
      expect(companyFacts.additionsToFixedAssets).toBeCloseTo(300);
    });

    it('using turnover from db', async () => {
      companyFacts.turnover = 200;
      await merge({});
      expect(companyFacts.turnover).toBeCloseTo(200);
    });

    it('using turnover from dto', async () => {
      companyFacts.turnover = 200;
      await merge({ turnover: 300 });
      expect(companyFacts.turnover).toBeCloseTo(300);
    });

    it('using totalAssets from db', async () => {
      companyFacts.totalAssets = 200;
      await merge({});
      expect(companyFacts.totalAssets).toBeCloseTo(200);
    });

    it('using totalAssets from dto', async () => {
      companyFacts.totalAssets = 200;
      await merge({ totalAssets: 300 });
      expect(companyFacts.totalAssets).toBeCloseTo(300);
    });

    it('using financialAssetsAndCashBalance from db', async () => {
      companyFacts.financialAssetsAndCashBalance = 200;
      await merge({});
      expect(companyFacts.financialAssetsAndCashBalance).toBeCloseTo(200);
    });

    it('using financialAssetsAndCashBalance from dto', async () => {
      companyFacts.financialAssetsAndCashBalance = 200;
      await merge({ financialAssetsAndCashBalance: 300 });
      expect(companyFacts.financialAssetsAndCashBalance).toBeCloseTo(300);
    });

    it('using numberOfEmployees from db', async () => {
      companyFacts.numberOfEmployees = 200;
      await merge({});
      expect(companyFacts.numberOfEmployees).toBeCloseTo(200);
    });

    it('using numberOfEmployees from dto', async () => {
      companyFacts.numberOfEmployees = 200;
      await merge({ numberOfEmployees: 300 });
      expect(companyFacts.numberOfEmployees).toBeCloseTo(300);
    });

    it('using hasCanteen from db', async () => {
      companyFacts.hasCanteen = true;
      await merge({});
      expect(companyFacts.numberOfEmployees).toBeTruthy();
    });

    it('using hasCanteen from dto', async () => {
      companyFacts.hasCanteen = true;
      await merge({ hasCanteen: false });
      expect(companyFacts.hasCanteen).toBeFalsy();
    });

    it('using averageJourneyToWorkForStaffInKm from db', async () => {
      companyFacts.averageJourneyToWorkForStaffInKm = 200;
      await merge({});
      expect(companyFacts.averageJourneyToWorkForStaffInKm).toBeCloseTo(200);
    });

    it('using averageJourneyToWorkForStaffInKm from dto', async () => {
      companyFacts.averageJourneyToWorkForStaffInKm = 200;
      await merge({ averageJourneyToWorkForStaffInKm: 300 });
      expect(companyFacts.averageJourneyToWorkForStaffInKm).toBeCloseTo(300);
    });

    it('using isB2B from db', async () => {
      companyFacts.isB2B = true;
      await merge({});
      expect(companyFacts.isB2B).toBeTruthy();
    });

    it('using isB2B from dto', async () => {
      companyFacts.isB2B = true;
      await merge({ isB2B: false });
      expect(companyFacts.isB2B).toBeFalsy();
    });

    it('using mainOriginOfOtherSuppliers from db', async () => {
      await merge({});
      expect(companyFacts.mainOriginOfOtherSuppliers).toMatchObject({
        countryCode: companyFacts.mainOriginOfOtherSuppliers.countryCode,
        costs: companyFacts.mainOriginOfOtherSuppliers.costs,
      });
    });

    it('using mainOriginOfOtherSuppliers from dto', async () => {
      await merge({
        totalPurchaseFromSuppliers: 500,
        mainOriginOfOtherSuppliers: 'DEU',
      });
      expect(companyFacts.mainOriginOfOtherSuppliers).toMatchObject({
        countryCode: 'DEU',
        costs: 500,
      });
    });
  });
});
