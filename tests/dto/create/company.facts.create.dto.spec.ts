import { CompanyFactsDTOCreate } from '../../../src/dto/create/company.facts.create.dto';

describe('CompanyFactsCreateDTO', () => {
  it('is created from json and returns a CompanyFacts entity', () => {
    const json = {
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
    const companyFactsDTOCreate: CompanyFactsDTOCreate =
      CompanyFactsDTOCreate.fromJSON(json);
    const result = companyFactsDTOCreate.toCompanyFacts('en');
    expect(result).toMatchObject(json);
  });

  it('is created using default values', () => {
    const companyFactsDTOCreate: CompanyFactsDTOCreate =
      CompanyFactsDTOCreate.fromJSON({});
    const result = companyFactsDTOCreate.toCompanyFacts('en');
    expect(result).toMatchObject({
      totalPurchaseFromSuppliers: 0,
      totalStaffCosts: 0,
      profit: 0,
      financialCosts: 0,
      incomeFromFinancialInvestments: 0,
      additionsToFixedAssets: 0,
      turnover: 0,
      totalAssets: 0,
      financialAssetsAndCashBalance: 0,
      numberOfEmployees: 0,
      hasCanteen: false,
      averageJourneyToWorkForStaffInKm: 0,
      isB2B: false,
      supplyFractions: [],
      employeesFractions: [],
      industrySectors: [],
    });
  });
});
