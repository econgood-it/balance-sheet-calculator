import { companyFactsFactory } from '../testData/balance.sheet';
import { EntityWithDtoMerger } from '../../src/merge/entity.with.dto.merger';

import { CompanyFacts } from '../../src/models/company.facts';
import { CompanyFactsPatchRequestBodySchema } from '../../src/dto/company.facts.dto';

describe('EntityWithDTOMerger', () => {
  let companyFacts: CompanyFacts;
  const entityWithDtoMerger = new EntityWithDtoMerger();

  beforeEach(() => {
    companyFacts = companyFactsFactory.empty();
  });

  describe('should merge companyFacts', () => {
    const merge = (json: any) =>
      entityWithDtoMerger.mergeCompanyFacts(
        companyFacts,
        CompanyFactsPatchRequestBodySchema.parse(json)
      );

    it('using profit from db', async () => {
      companyFacts.profit = 200;
      const merged = await merge({});
      expect(merged.profit).toBeCloseTo(200);
    });

    it('using profit from dto', async () => {
      companyFacts.profit = 200;
      const merged = merge({ profit: 300 });
      expect(merged.profit).toBeCloseTo(300);
    });

    it('using supplyFractions from db', async () => {
      const supplyFractions = [
        { countryCode: 'BEL', costs: 20, industryCode: 'A' },
        { countryCode: 'DEU', costs: 13, industryCode: 'B' },
      ];
      companyFacts.supplyFractions = supplyFractions;
      const merged = await merge({});
      expect(merged.supplyFractions).toMatchObject(supplyFractions);
    });

    it('using supplyFractions from dto', async () => {
      const supplyFractions = [
        { countryCode: 'BEL', costs: 20, industryCode: 'A' },
        { countryCode: 'DEU', costs: 13, industryCode: 'B' },
      ];
      companyFacts.supplyFractions = [
        { countryCode: 'ALG', costs: 5, industryCode: 'Ce' },
      ];
      const merged = await merge({ supplyFractions });
      expect(merged.supplyFractions).toMatchObject(supplyFractions);
    });

    it('using employeesFractions from db', async () => {
      const employeesFractions = [
        { countryCode: 'BEL', percentage: 0.2 },
        { countryCode: 'DEU', percentage: 0.3 },
      ];
      companyFacts.employeesFractions = employeesFractions;
      const merged = await merge({});
      expect(merged.employeesFractions).toMatchObject(employeesFractions);
    });

    it('using employeesFractions from dto', async () => {
      const employeesFractions = [
        { countryCode: 'BEL', percentage: 0.2 },
        { countryCode: 'DEU', percentage: 1 },
      ];
      companyFacts.employeesFractions = [
        { countryCode: 'ALG', percentage: 0.4 },
      ];
      const merged = await merge({ employeesFractions });
      expect(merged.employeesFractions).toMatchObject(employeesFractions);
    });

    it('using totalPurchaseFromSuppliers from db', async () => {
      companyFacts.totalPurchaseFromSuppliers = 200;
      const merged = merge({});
      expect(merged.totalPurchaseFromSuppliers).toBeCloseTo(200);
    });

    it('using totalPurchaseFromSuppliers from dto', async () => {
      companyFacts.totalPurchaseFromSuppliers = 200;
      const merged = merge({ totalPurchaseFromSuppliers: 300 });
      expect(merged.totalPurchaseFromSuppliers).toBeCloseTo(300);
    });

    it('using totalStaffCosts from db', async () => {
      companyFacts.totalStaffCosts = 200;
      const merged = merge({});
      expect(merged.totalStaffCosts).toBeCloseTo(200);
    });

    it('using totalStaffCosts from dto', async () => {
      companyFacts.totalStaffCosts = 200;
      const merged = merge({ totalStaffCosts: 300 });
      expect(merged.totalStaffCosts).toBeCloseTo(300);
    });

    it('using financialCosts from db', async () => {
      companyFacts.financialCosts = 200;
      const merged = merge({});
      expect(merged.financialCosts).toBeCloseTo(200);
    });

    it('using financialCosts from dto', async () => {
      companyFacts.financialCosts = 200;
      const merged = merge({ financialCosts: 300 });
      expect(merged.financialCosts).toBeCloseTo(300);
    });

    it('using incomeFromFinancialInvestments from db', async () => {
      companyFacts.incomeFromFinancialInvestments = 200;
      const merged = merge({});
      expect(merged.incomeFromFinancialInvestments).toBeCloseTo(200);
    });

    it('using incomeFromFinancialInvestments from dto', async () => {
      companyFacts.incomeFromFinancialInvestments = 200;
      const merged = merge({ incomeFromFinancialInvestments: 300 });
      expect(merged.incomeFromFinancialInvestments).toBeCloseTo(300);
    });

    it('using additionsToFixedAssets from db', async () => {
      companyFacts.additionsToFixedAssets = 200;
      const merged = merge({});
      expect(merged.additionsToFixedAssets).toBeCloseTo(200);
    });

    it('using additionsToFixedAssets from dto', async () => {
      companyFacts.additionsToFixedAssets = 200;
      const merged = merge({ additionsToFixedAssets: 300 });
      expect(merged.additionsToFixedAssets).toBeCloseTo(300);
    });

    it('using turnover from db', async () => {
      companyFacts.turnover = 200;
      const merged = merge({});
      expect(merged.turnover).toBeCloseTo(200);
    });

    it('using turnover from dto', async () => {
      companyFacts.turnover = 200;
      const merged = merge({ turnover: 300 });
      expect(merged.turnover).toBeCloseTo(300);
    });

    it('using totalAssets from db', async () => {
      companyFacts.totalAssets = 200;
      const merged = merge({});
      expect(merged.totalAssets).toBeCloseTo(200);
    });

    it('using totalAssets from dto', async () => {
      companyFacts.totalAssets = 200;
      const merged = merge({ totalAssets: 300 });
      expect(merged.totalAssets).toBeCloseTo(300);
    });

    it('using financialAssetsAndCashBalance from db', async () => {
      companyFacts.financialAssetsAndCashBalance = 200;
      const merged = merge({});
      expect(merged.financialAssetsAndCashBalance).toBeCloseTo(200);
    });

    it('using financialAssetsAndCashBalance from dto', async () => {
      companyFacts.financialAssetsAndCashBalance = 200;
      const merged = merge({ financialAssetsAndCashBalance: 300 });
      expect(merged.financialAssetsAndCashBalance).toBeCloseTo(300);
    });

    it('using numberOfEmployees from db', async () => {
      companyFacts.numberOfEmployees = 200;
      const merged = merge({});
      expect(merged.numberOfEmployees).toBeCloseTo(200);
    });

    it('using numberOfEmployees from dto', async () => {
      companyFacts.numberOfEmployees = 200;
      const merged = merge({ numberOfEmployees: 300 });
      expect(merged.numberOfEmployees).toBeCloseTo(300);
    });

    it('using hasCanteen from db', async () => {
      companyFacts.hasCanteen = true;
      const merged = merge({});
      expect(merged.hasCanteen).toBeTruthy();
    });

    it('using hasCanteen from dto', async () => {
      companyFacts.hasCanteen = true;
      const merged = merge({ hasCanteen: false });
      expect(merged.hasCanteen).toBeFalsy();
    });

    it('using averageJourneyToWorkForStaffInKm from db', async () => {
      companyFacts.averageJourneyToWorkForStaffInKm = 200;
      const merged = merge({});
      expect(merged.averageJourneyToWorkForStaffInKm).toBeCloseTo(200);
    });

    it('using averageJourneyToWorkForStaffInKm from dto', async () => {
      companyFacts.averageJourneyToWorkForStaffInKm = 200;
      const merged = merge({ averageJourneyToWorkForStaffInKm: 300 });
      expect(merged.averageJourneyToWorkForStaffInKm).toBeCloseTo(300);
    });

    it('using isB2B from db', async () => {
      companyFacts.isB2B = true;
      const merged = merge({});
      expect(merged.isB2B).toBeTruthy();
    });

    it('using isB2B from dto', async () => {
      companyFacts.isB2B = true;
      const merged = merge({ isB2B: false });
      expect(merged.isB2B).toBeFalsy();
    });

    it('using mainOriginOfOtherSuppliers from db', async () => {
      const merged = merge({});
      expect(merged.mainOriginOfOtherSuppliers).toMatchObject({
        countryCode: companyFacts.mainOriginOfOtherSuppliers.countryCode,
        costs: companyFacts.mainOriginOfOtherSuppliers.costs,
      });
    });

    it('using mainOriginOfOtherSuppliers from dto', async () => {
      const merged = merge({
        totalPurchaseFromSuppliers: 500,
        mainOriginOfOtherSuppliers: 'DEU',
      });
      expect(merged.mainOriginOfOtherSuppliers).toMatchObject({
        countryCode: 'DEU',
        costs: 500,
      });
    });
  });
});
