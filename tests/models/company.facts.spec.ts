import { makeCompanyFacts } from '../../src/models/company.facts';

describe('Company Facts', () => {
  it('creates empty company facts', () => {
    const companyFacts = makeCompanyFacts();
    expect(companyFacts).toMatchObject({
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
      mainOriginOfOtherSuppliers: { countryCode: 'AWO', costs: 0 },
    });
  });
});
