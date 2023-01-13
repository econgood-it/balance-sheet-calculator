import {
  companyFactsFactory,
  companyFactsJsonFactory,
} from '../testData/balance.sheet';
import { DEFAULT_COUNTRY_CODE } from '../../src/models/region';
import {
  allValuesAreZero,
  CompanyFacts,
  CompanyFactsSchema,
} from '../../src/models/company.facts';

describe('Company Facts', () => {
  it('allValuesAreZero should return true', () => {
    expect(allValuesAreZero(companyFactsFactory.empty())).toBeTruthy();
  });

  it('allValuesAreZero should return true if hasCanteen is undefined', () => {
    expect(
      allValuesAreZero({
        ...companyFactsFactory.empty(),
        hasCanteen: undefined,
      })
    ).toBeTruthy();
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

  it('parse object where no country code for main origin of other suppliers is provided', () => {
    const companyFacts = {
      ...companyFactsJsonFactory.empty(),
      mainOriginOfOtherSuppliers: { costs: 9 },
    };
    expect(CompanyFactsSchema.safeParse(companyFacts).success).toBeTruthy();
  });

  it('parse object where some of the supplier country codes are missing', () => {
    const companyFacts = {
      ...companyFactsJsonFactory.empty(),
      supplyFractions: [
        { countryCode: 'ARE', costs: 5, industryCode: 'A' },
        { costs: 7, industryCode: 'Be' },
      ],
      mainOriginOfOtherSuppliers: { countryCode: 'DEU', costs: 9 },
    };
    expect(CompanyFactsSchema.safeParse(companyFacts).success).toBeTruthy();
  });

  it('parse object where some of the supplier industry codes are missing', () => {
    const companyFacts = {
      ...companyFactsJsonFactory.empty(),
      supplyFractions: [
        { countryCode: 'ARE', costs: 5, industryCode: 'A' },
        { countryCode: 'ARE', costs: 7 },
      ],
      mainOriginOfOtherSuppliers: { countryCode: 'DEU', costs: 9 },
    };
    expect(CompanyFactsSchema.safeParse(companyFacts).success).toBeTruthy();
  });

  it('parse object where hasCanteen is undefined', () => {
    const companyFacts = {
      ...companyFactsJsonFactory.empty(),
      hasCanteen: undefined,
      mainOriginOfOtherSuppliers: { countryCode: 'DEU', costs: 9 },
    };
    const result = CompanyFactsSchema.safeParse(companyFacts);
    expect(result.success).toBeTruthy();
    expect(result.success && result.data.hasCanteen).toBeUndefined();
  });
});
