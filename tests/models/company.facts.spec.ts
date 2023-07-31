import { DEFAULT_COUNTRY_CODE } from '../../src/models/region';
import {
  allValuesAreZero,
  CompanyFacts,
  CompanyFactsCreateRequestBodyTransformedSchema,
  CompanyFactsSchema,
} from '../../src/models/company.facts';
import {
  companyFactsFactory,
  companyFactsJsonFactory,
} from '../../src/openapi/examples';

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
      ...companyFactsJsonFactory.emptyRequest(),
      mainOriginOfOtherSuppliers: { costs: 9 },
    };
    expect(CompanyFactsSchema.safeParse(companyFacts).success).toBeTruthy();
  });

  it('parse object where some of the supplier country codes are missing', () => {
    const companyFacts = {
      ...companyFactsJsonFactory.emptyRequest(),
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
      ...companyFactsJsonFactory.emptyRequest(),
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
      ...companyFactsJsonFactory.emptyRequest(),
      hasCanteen: undefined,
      mainOriginOfOtherSuppliers: { countryCode: 'DEU', costs: 9 },
    };
    const result = CompanyFactsSchema.safeParse(companyFacts);
    expect(result.success).toBeTruthy();
    expect(result.success && result.data.hasCanteen).toBeUndefined();
  });

  it('parse object where the industry codes of some industry sectors are missing', () => {
    const companyFacts = {
      ...companyFactsJsonFactory.emptyRequest(),
      industrySectors: [
        { amountOfTotalTurnover: 0.4, description: 'desc', industryCode: 'A' },
        { amountOfTotalTurnover: 0.6, description: 'desc' },
      ],
      mainOriginOfOtherSuppliers: { countryCode: 'DEU', costs: 9 },
    };
    const result = CompanyFactsSchema.safeParse(companyFacts);
    expect(result.success).toBeTruthy();
    expect(
      result.success && result.data.industrySectors[1].industryCode
    ).toBeUndefined();
  });
});

describe('CompanyFactsCreateRequestBodySchema', () => {
  it('parse json and returns a CompanyFacts entity', () => {
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
    const result = CompanyFactsCreateRequestBodyTransformedSchema.parse(json);
    expect(result).toMatchObject(json);
  });

  it('parse json using default values', () => {
    const result = CompanyFactsCreateRequestBodyTransformedSchema.parse({});
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
      averageJourneyToWorkForStaffInKm: 0,
      isB2B: false,
      supplyFractions: [],
      employeesFractions: [],
      industrySectors: [],
    });
  });

  it('parse with default main origin of other suppliers', () => {
    const supplyFractions = [
      { industryCode: 'A', countryCode: 'DEU', costs: 200 },
      { industryCode: 'A', countryCode: 'DEU', costs: 100 },
    ];
    const result = CompanyFactsCreateRequestBodyTransformedSchema.parse({
      totalPurchaseFromSuppliers: 500,
      supplyFractions,
    });
    expect(result).toMatchObject({
      totalPurchaseFromSuppliers: 500,
      supplyFractions,
      mainOriginOfOtherSuppliers: {
        countryCode: undefined,
        costs: 200,
      },
    });
  });

  it('parse json where mainOriginOfOtherSuppliers costs is equal to totalPurchaseFromSuppliers', () => {
    const result = CompanyFactsCreateRequestBodyTransformedSchema.parse({
      totalPurchaseFromSuppliers: 500,
      supplyFractions: [],
    });
    expect(result).toMatchObject({
      mainOriginOfOtherSuppliers: {
        countryCode: undefined,
        costs: 500,
      },
    });
  });
  it('parse json where country code of mainOriginOfOtherSuppliers is provided', () => {
    const result = CompanyFactsCreateRequestBodyTransformedSchema.parse({
      totalPurchaseFromSuppliers: 500,
      supplyFractions: [],
      mainOriginOfOtherSuppliers: 'DEU',
    });
    expect(result).toMatchObject({
      mainOriginOfOtherSuppliers: {
        countryCode: 'DEU',
        costs: 500,
      },
    });
  });

  it('allows negative values for incomeFromFinancialInvestments and additionsToFixedAssets', async () => {
    const result = CompanyFactsCreateRequestBodyTransformedSchema.safeParse({
      incomeFromFinancialInvestments: -20,
      additionsToFixedAssets: -70,
    });
    expect(result.success).toBeTruthy();
  });

  it('parse json where no country code for main origin of other suppliers is provided', () => {
    const companyFactsJson = {
      ...companyFactsJsonFactory.emptyRequest(),
      totalPurchaseFromSuppliers: 9,
      mainOriginOfOtherSuppliers: undefined,
    };
    const result =
      CompanyFactsCreateRequestBodyTransformedSchema.safeParse(
        companyFactsJson
      );

    expect(result.success).toBeTruthy();
    expect(result.success && result.data.mainOriginOfOtherSuppliers.costs).toBe(
      9
    );
  });

  it('parse json where industry codes of some industry sectors are missing', () => {
    const companyFactsJson = {
      ...companyFactsJsonFactory.emptyRequest(),
      totalPurchaseFromSuppliers: 9,
      mainOriginOfOtherSuppliers: undefined,
      industrySectors: [
        {
          description: 'debe',
          amountOfTotalTurnover: 0.6,
        },
      ],
    };
    const result =
      CompanyFactsCreateRequestBodyTransformedSchema.safeParse(
        companyFactsJson
      );

    expect(result.success).toBeTruthy();
    expect(
      result.success && result.data.industrySectors[0].industryCode
    ).toBeUndefined();
  });

  it('parse json where some of the supplier country codes are missing', () => {
    const companyFacts = {
      ...companyFactsJsonFactory.emptyRequest(),
      supplyFractions: [
        { countryCode: 'ARE', costs: 5, industryCode: 'A' },
        { costs: 7, industryCode: 'Be' },
      ],
    };
    expect(
      CompanyFactsCreateRequestBodyTransformedSchema.safeParse(companyFacts)
        .success
    ).toBeTruthy();
  });
  it('parse json where hasCanteen is not provided', () => {
    const result = CompanyFactsCreateRequestBodyTransformedSchema.parse({
      totalPurchaseFromSuppliers: 9,
    });
    expect(result.hasCanteen).toBeUndefined();
  });
});

describe('CompanyFactsPatchRequestBodySchema', () => {
  it('parse with employees fractions with missing country code', () => {
    const employeesFractions = [{ percentage: 80 }];
    const result = CompanyFactsCreateRequestBodyTransformedSchema.parse({
      employeesFractions,
    });
    expect(result).toMatchObject({
      employeesFractions: [{ percentage: 0.8 }],
    });
  });

  it('parse with supply fraction with missing industry code', () => {
    const supplyFractions = [{ costs: 0.8, countryCode: 'DEU' }];
    const result = CompanyFactsCreateRequestBodyTransformedSchema.parse({
      supplyFractions,
    });
    expect(result).toMatchObject({
      supplyFractions,
    });
  });
});
