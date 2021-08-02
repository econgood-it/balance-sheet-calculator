import { validate } from 'class-validator';
import { CompanyFactsDTOCreate } from '../../../src/dto/create/company.facts.create.dto';
import { DEFAULT_COUNTRY_CODE } from '../../../src/entities/region';

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

  it('is created with default main origin of other suppliers', () => {
    const supplyFractions = [
      { industryCode: 'A', countryCode: 'DEU', costs: 200 },
      { industryCode: 'A', countryCode: 'DEU', costs: 100 },
    ];
    const companyFactsDTOCreate: CompanyFactsDTOCreate =
      CompanyFactsDTOCreate.fromJSON({
        totalPurchaseFromSuppliers: 500,
        supplyFractions: supplyFractions,
      });
    const result = companyFactsDTOCreate.toCompanyFacts('en');
    expect(result).toMatchObject({
      totalPurchaseFromSuppliers: 500,
      supplyFractions: supplyFractions,
      mainOriginOfOtherSuppliers: {
        countryCode: DEFAULT_COUNTRY_CODE,
        costs: 200,
      },
    });
  });

  it('is created where mainOriginOfOtherSuppliers costs is equal to totalPurchaseFromSuppliers', () => {
    const companyFactsDTOCreate: CompanyFactsDTOCreate =
      CompanyFactsDTOCreate.fromJSON({
        totalPurchaseFromSuppliers: 500,
        supplyFractions: [],
      });
    const result = companyFactsDTOCreate.toCompanyFacts('en');
    expect(result).toMatchObject({
      mainOriginOfOtherSuppliers: {
        countryCode: DEFAULT_COUNTRY_CODE,
        costs: 500,
      },
    });
  });

  it('allows negative values for incomeFromFinancialInvestments and additionsToFixedAssets', async () => {
    const companyFactsDTOCreate: CompanyFactsDTOCreate =
      CompanyFactsDTOCreate.fromJSON({
        incomeFromFinancialInvestments: -20,
        additionsToFixedAssets: -70,
      });
    const validationErrors = await validate(companyFactsDTOCreate, {
      validationError: { target: false },
    });
    expect(validationErrors).toHaveLength(0);
  });
});
