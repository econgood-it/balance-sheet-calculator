import { DEFAULT_COUNTRY_CODE } from '../../src/models/region';
import {
  BalanceSheet,
  BalanceSheetType,
  BalanceSheetVersion,
} from '../../src/models/balance.sheet';
import { RatingsFactory } from '../../src/factories/ratings.factory';
import { CompanyFacts } from '../../src/models/company.facts';

const arabEmiratesCode = 'ARE';
const afghanistanCode = 'AFG';
const agricultureCode = 'A';
const pharmaceuticCode = 'Ce';

// const supplyFractions: SupplyFraction[] = [
//   new SupplyFraction(undefined, agricultureCode, arabEmiratesCode, 500),
//   new SupplyFraction(undefined, pharmaceuticCode, afghanistanCode, 600),
// ];
// const employeesFractions: EmployeesFraction[] = [
//   new EmployeesFraction(undefined, arabEmiratesCode, 0.5),
//   new EmployeesFraction(undefined, afghanistanCode, 0.5),
// ];

export const balanceSheetFactory = {
  emptyV508: (): BalanceSheet => ({
    type: BalanceSheetType.Full,
    version: BalanceSheetVersion.v5_0_8,
    companyFacts: companyFactsFactory.empty(),
    ratings: RatingsFactory.createDefaultRatings(
      BalanceSheetType.Full,
      BalanceSheetVersion.v5_0_8
    ),
  }),
};

export const companyFactsFactory = {
  empty: (): CompanyFacts => ({
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
    mainOriginOfOtherSuppliers: { countryCode: DEFAULT_COUNTRY_CODE, costs: 0 },
  }),
  nonEmpty: (): CompanyFacts => ({
    totalPurchaseFromSuppliers: 10_000,
    totalStaffCosts: 900,
    profit: 500,
    financialCosts: 600,
    incomeFromFinancialInvestments: 700,
    additionsToFixedAssets: 800,
    turnover: 0,
    totalAssets: 30,
    financialAssetsAndCashBalance: 40,
    numberOfEmployees: 0,
    hasCanteen: false,
    averageJourneyToWorkForStaffInKm: 0,
    isB2B: false,
    supplyFractions: [
      {
        industryCode: agricultureCode,
        countryCode: arabEmiratesCode,
        costs: 500,
      },
      {
        industryCode: pharmaceuticCode,
        countryCode: afghanistanCode,
        costs: 600,
      },
    ],
    employeesFractions: [
      { countryCode: afghanistanCode, percentage: 0.5 },
      { countryCode: arabEmiratesCode, percentage: 0.5 },
    ],
    industrySectors: [],
    mainOriginOfOtherSuppliers: { countryCode: DEFAULT_COUNTRY_CODE, costs: 0 },
  }),
  nonEmpty2: (): CompanyFacts => ({
    totalPurchaseFromSuppliers: 0,
    totalStaffCosts: 2345,
    profit: 238,
    financialCosts: 473,
    incomeFromFinancialInvestments: 342,
    additionsToFixedAssets: 234,
    turnover: 30,
    totalAssets: 40,
    financialAssetsAndCashBalance: 0,
    numberOfEmployees: 0,
    hasCanteen: false,
    averageJourneyToWorkForStaffInKm: 0,
    isB2B: false,
    supplyFractions: [
      {
        industryCode: agricultureCode,
        countryCode: arabEmiratesCode,
        costs: 300,
      },
      {
        industryCode: pharmaceuticCode,
        countryCode: afghanistanCode,
        costs: 20,
      },
    ],
    employeesFractions: [
      { countryCode: arabEmiratesCode, percentage: 0.3 },
      { countryCode: afghanistanCode, percentage: 1 },
    ],
    industrySectors: [],
    mainOriginOfOtherSuppliers: { countryCode: DEFAULT_COUNTRY_CODE, costs: 0 },
  }),
};

export const companyFactsJsonFactory = {
  empty: (): any => ({
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
  }),
  nonEmpty: (): any => ({
    id: undefined,
    totalPurchaseFromSuppliers: 10000,
    totalStaffCosts: 900,
    profit: 500,
    financialCosts: 600,
    incomeFromFinancialInvestments: 700,
    additionsToFixedAssets: 800,
    turnover: 0,
    totalAssets: 30,
    financialAssetsAndCashBalance: 40,
    numberOfEmployees: 0,
    hasCanteen: false,
    averageJourneyToWorkForStaffInKm: 0,
    isB2B: false,
    supplyFractions: [
      {
        id: undefined,
        industryCode: agricultureCode,
        countryCode: arabEmiratesCode,
        costs: 500,
      },
      {
        id: undefined,
        industryCode: pharmaceuticCode,
        countryCode: afghanistanCode,
        costs: 600,
      },
    ],
    employeesFractions: [
      { id: undefined, countryCode: arabEmiratesCode, percentage: 0.5 },
      { id: undefined, countryCode: afghanistanCode, percentage: 0.5 },
    ],
    industrySectors: [],
  }),
};
