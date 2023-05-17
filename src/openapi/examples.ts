import { BalanceSheet } from '../models/balance.sheet';
import { RatingsFactory } from '../factories/ratings.factory';
import { CompanyFacts } from '../models/company.facts';
import { DEFAULT_COUNTRY_CODE } from '../models/region';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { Organization } from '../models/organization';

const arabEmiratesCode = 'ARE';
const afghanistanCode = 'AFG';
const agricultureCode = 'A';
const pharmaceuticCode = 'Ce';
export const balanceSheetJsonFactory = {
  emptyV508: (): BalanceSheet => ({
    type: BalanceSheetType.Full,
    version: BalanceSheetVersion.v5_0_8,
    companyFacts: companyFactsJsonFactory.empty(),
    ratings: RatingsFactory.createDefaultRatings(
      BalanceSheetType.Full,
      BalanceSheetVersion.v5_0_8
    ),
  }),
  minimalCompactV506: () => ({
    type: BalanceSheetType.Compact,
    version: BalanceSheetVersion.v5_0_6,
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
  emptyWithoutOptionalValues: (): CompanyFacts => ({
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
    mainOriginOfOtherSuppliers: { costs: 0 },
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
    mainOriginOfOtherSuppliers: {
      countryCode: DEFAULT_COUNTRY_CODE,
      costs: 8_900,
    },
  }),
  nonEmpty2: (): CompanyFacts => ({
    totalPurchaseFromSuppliers: 330,
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
      { countryCode: afghanistanCode, percentage: 0.7 },
    ],
    industrySectors: [],
    mainOriginOfOtherSuppliers: {
      countryCode: DEFAULT_COUNTRY_CODE,
      costs: 10,
    },
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
      { id: undefined, countryCode: arabEmiratesCode, percentage: 50 },
      { id: undefined, countryCode: afghanistanCode, percentage: 80 },
    ],
    industrySectors: [{ industryCode: 'A', amountOfTotalTurnover: 100 }],
  }),
};
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

export const organizationFactory = {
  default: (): Organization => ({
    address: {
      street: 'Example street',
      houseNumber: '28a',
      zip: '999999',
      city: 'Example city',
    },
  }),
};
