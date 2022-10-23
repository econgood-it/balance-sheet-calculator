import { companyFactsFactory } from '../testData/balance.sheet';
import { DEFAULT_COUNTRY_CODE } from '../../src/models/region';
import { allValuesAreZero, CompanyFacts } from '../../src/models/company.facts';

describe('Company Facts', () => {
  it('allValuesAreZero should return true', () => {
    expect(allValuesAreZero(companyFactsFactory.empty())).toBeTruthy();
  });
  it('allValuesAreZero should return false', () => {
    const value = 3;

    const companyFacts: CompanyFacts = {
      totalPurchaseFromSuppliers: value,
      totalStaffCosts: value,
      profit: value,
      financialCosts: value,
      incomeFromFinancialInvestments: value,
      additionsToFixedAssets: value,
      turnover: value,
      totalAssets: value,
      financialAssetsAndCashBalance: value,
      numberOfEmployees: value,
      hasCanteen: true,
      averageJourneyToWorkForStaffInKm: value,
      isB2B: true,
      supplyFractions: [
        { countryCode: 'DEU', costs: value, industryCode: 'A' },
      ],
      employeesFractions: [{ countryCode: 'DEU', percentage: value }],
      industrySectors: [
        { industryCode: 'A', amountOfTotalTurnover: value, description: '' },
      ],
      mainOriginOfOtherSuppliers: {
        countryCode: DEFAULT_COUNTRY_CODE,
        costs: 0,
      },
    };

    expect(allValuesAreZero(companyFacts)).toBeFalsy();
  });
});
