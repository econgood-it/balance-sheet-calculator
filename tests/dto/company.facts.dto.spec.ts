import {
  CompanyFactsCreateRequestBodySchema,
  CompanyFactsPatchRequestBodySchema,
} from '../../src/dto/company.facts.dto';
import { companyFactsJsonFactory } from '../testData/balance.sheet';

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
    const result = CompanyFactsCreateRequestBodySchema.parse(json);
    expect(result).toMatchObject(json);
  });

  it('parse json using default values', () => {
    const result = CompanyFactsCreateRequestBodySchema.parse({});
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
    const result = CompanyFactsCreateRequestBodySchema.parse({
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
    const result = CompanyFactsCreateRequestBodySchema.parse({
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
    const result = CompanyFactsCreateRequestBodySchema.parse({
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
    const result = CompanyFactsCreateRequestBodySchema.safeParse({
      incomeFromFinancialInvestments: -20,
      additionsToFixedAssets: -70,
    });
    expect(result.success).toBeTruthy();
  });

  it('parse json where no country code for main origin of other suppliers is provided', () => {
    const companyFactsJson = {
      ...companyFactsJsonFactory.empty(),
      totalPurchaseFromSuppliers: 9,
      mainOriginOfOtherSuppliers: undefined,
    };
    const result =
      CompanyFactsCreateRequestBodySchema.safeParse(companyFactsJson);

    expect(result.success).toBeTruthy();
    expect(result.success && result.data.mainOriginOfOtherSuppliers.costs).toBe(
      9
    );
  });

  it('parse json where some of the supplier country codes are missing', () => {
    const companyFacts = {
      ...companyFactsJsonFactory.empty(),
      supplyFractions: [
        { countryCode: 'ARE', costs: 5, industryCode: 'A' },
        { costs: 7, industryCode: 'Be' },
      ],
    };
    expect(
      CompanyFactsCreateRequestBodySchema.safeParse(companyFacts).success
    ).toBeTruthy();
  });
  it('parse json where hasCanteen is not provided', () => {
    const result = CompanyFactsCreateRequestBodySchema.parse({
      totalPurchaseFromSuppliers: 9,
    });
    expect(result.hasCanteen).toBeUndefined();
  });
});

describe('CompanyFactsPatchRequestBodySchema', () => {
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
    mainOriginOfOtherSuppliers: 'DEU',
  };

  it('parse from json', () => {
    const companyFactsPatchRequestBody =
      CompanyFactsPatchRequestBodySchema.parse(jsonConst);
    expect(companyFactsPatchRequestBody).toMatchObject(jsonConst);
  });

  it('allows negative values for incomeFromFinancialInvestments and additionsToFixedAssets', async () => {
    const result = CompanyFactsPatchRequestBodySchema.safeParse({
      incomeFromFinancialInvestments: -20,
      additionsToFixedAssets: -70,
    });
    expect(result.success).toBeTruthy();
  });

  describe('parse json where value is missing for field', () => {
    let json: any;
    beforeEach(() => {
      json = jsonConst;
    });

    it('financialAssetsAndCashBalance', () => {
      delete json.financialAssetsAndCashBalance;
      const companyFactsPatchRequestBody =
        CompanyFactsPatchRequestBodySchema.parse(json);
      expect(
        companyFactsPatchRequestBody.financialAssetsAndCashBalance
      ).toBeUndefined();
    });

    it('profit', () => {
      delete json.profit;
      const companyFactsPatchRequestBody =
        CompanyFactsPatchRequestBodySchema.parse(json);

      expect(companyFactsPatchRequestBody.profit).toBeUndefined();
    });

    it('numberOfEmployees', () => {
      delete json.numberOfEmployees;
      const companyFactsPatchRequestBody =
        CompanyFactsPatchRequestBodySchema.parse(json);
      expect(companyFactsPatchRequestBody.numberOfEmployees).toBeUndefined();
    });

    it('hasCanteen', () => {
      delete json.hasCanteen;
      const companyFactsPatchRequestBody =
        CompanyFactsPatchRequestBodySchema.parse(json);
      expect(companyFactsPatchRequestBody.hasCanteen).toBeUndefined();
    });

    it('averageJourneyToWorkForStaffInKm', () => {
      delete json.averageJourneyToWorkForStaffInKm;
      const companyFactsPatchRequestBody =
        CompanyFactsPatchRequestBodySchema.parse(json);
      expect(
        companyFactsPatchRequestBody.averageJourneyToWorkForStaffInKm
      ).toBeUndefined();
    });

    it('isB2B', () => {
      delete json.isB2B;
      const companyFactsPatchRequestBody =
        CompanyFactsPatchRequestBodySchema.parse(json);
      expect(companyFactsPatchRequestBody.isB2B).toBeUndefined();
    });
  });

  it('parse with employees fractions with missing country code', () => {
    const employeesFractions = [{ percentage: 0.8 }];
    const result = CompanyFactsCreateRequestBodySchema.parse({
      employeesFractions,
    });
    expect(result).toMatchObject({
      employeesFractions,
    });
  });

  it('parse with supply fraction with missing industry code', () => {
    const supplyFractions = [{ costs: 0.8, countryCode: 'DEU' }];
    const result = CompanyFactsCreateRequestBodySchema.parse({
      supplyFractions,
    });
    expect(result).toMatchObject({
      supplyFractions,
    });
  });
});
