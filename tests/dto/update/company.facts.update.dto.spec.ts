import { validate } from 'class-validator';
import { CompanyFactsDTOUpdate } from '../../../src/dto/update/company.facts.update.dto';

describe('CompanyFactsUpdateDTO', () => {
  const jsonConst = {
    totalPurchaseFromSuppliers: 1,
    totalStaffCosts: 2,
    profit: 3,
    financialCosts: 4,
    incomeFromFinancialInvestments: 5,
    additionsToFixedAssets: 6,
    turnover: 7,
    totalAssets: 8,
    financialAssetsAndCashBalance: 9,
    numberOfEmployees: 11,
    hasCanteen: true,
    averageJourneyToWorkForStaffInKm: 12,
    isB2B: true,
    supplyFractions: [],
    employeesFractions: [],
    industrySectors: [],
  };

  it('is created from json', () => {
    const companyFactsDTOUpdate: CompanyFactsDTOUpdate =
      CompanyFactsDTOUpdate.fromJSON(jsonConst);
    expect(companyFactsDTOUpdate).toMatchObject(jsonConst);
  });

  it('allows negative values for incomeFromFinancialInvestments and additionsToFixedAssets', async () => {
    const companyFactsDTOUpdate: CompanyFactsDTOUpdate =
      CompanyFactsDTOUpdate.fromJSON({
        incomeFromFinancialInvestments: -20,
        additionsToFixedAssets: -70,
      });
    const validationErrors = await validate(companyFactsDTOUpdate, {
      validationError: { target: false },
    });
    expect(validationErrors).toHaveLength(0);
  });

  describe('is created from json where value is missing for field', () => {
    let json: any;
    beforeEach(() => {
      json = jsonConst;
    });

    it('financialAssetsAndCashBalance', () => {
      delete json.financialAssetsAndCashBalance;
      const companyFactsDTOUpdate: CompanyFactsDTOUpdate =
        CompanyFactsDTOUpdate.fromJSON(json);
      expect(
        companyFactsDTOUpdate.financialAssetsAndCashBalance
      ).toBeUndefined();
    });

    it('profit', () => {
      delete json.profit;
      const companyFactsDTOUpdate: CompanyFactsDTOUpdate =
        CompanyFactsDTOUpdate.fromJSON(json);
      expect(companyFactsDTOUpdate.profit).toBeUndefined();
    });

    it('numberOfEmployees', () => {
      delete json.numberOfEmployees;
      const companyFactsDTOUpdate: CompanyFactsDTOUpdate =
        CompanyFactsDTOUpdate.fromJSON(json);
      expect(companyFactsDTOUpdate.numberOfEmployees).toBeUndefined();
    });

    it('hasCanteen', () => {
      delete json.hasCanteen;
      const companyFactsDTOUpdate: CompanyFactsDTOUpdate =
        CompanyFactsDTOUpdate.fromJSON(json);
      expect(companyFactsDTOUpdate.hasCanteen).toBeUndefined();
    });

    it('averageJourneyToWorkForStaffInKm', () => {
      delete json.averageJourneyToWorkForStaffInKm;
      const companyFactsDTOUpdate: CompanyFactsDTOUpdate =
        CompanyFactsDTOUpdate.fromJSON(json);
      expect(
        companyFactsDTOUpdate.averageJourneyToWorkForStaffInKm
      ).toBeUndefined();
    });

    it('isB2B', () => {
      delete json.isB2B;
      const companyFactsDTOUpdate: CompanyFactsDTOUpdate =
        CompanyFactsDTOUpdate.fromJSON(json);
      expect(companyFactsDTOUpdate.isB2B).toBeUndefined();
    });
  });
});
