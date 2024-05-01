import { OldBalanceSheet } from '../models/oldBalanceSheet';
import { OldRatingsFactory } from '../factories/oldRatingsFactory';
import { OldCompanyFacts } from '../models/oldCompanyFacts';
import { DEFAULT_COUNTRY_CODE } from '../models/region';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { OldOrganization } from '../models/oldOrganization';
import { OldStakeholderWeight } from '../models/oldStakeholderWeight';
import { WorkbookSection } from '../entities/workbook.entity';
import { z } from 'zod';
import { CompanyFactsResponseBodySchema } from '@ecogood/e-calculator-schemas/dist/company.facts.dto';
import deepFreeze from 'deep-freeze';
import {
  CompanyFacts,
  makeCompanyFacts,
  makeEmployeesFraction,
  makeSupplyFraction,
} from '../models/company.facts';

const arabEmiratesCode = 'ARE';
const afghanistanCode = 'AFG';
const agricultureCode = 'A';
const pharmaceuticCode = 'Ce';
export const balanceSheetJsonFactory = {
  emptyFullV508: (): OldBalanceSheet => ({
    type: BalanceSheetType.Full,
    version: BalanceSheetVersion.v5_0_8,
    companyFacts: companyFactsJsonFactory.emptyRequest(),
    ratings: OldRatingsFactory.createDefaultRatings(
      BalanceSheetType.Full,
      BalanceSheetVersion.v5_0_8
    ),
    stakeholderWeights: [],
  }),
  emptyCompactV506: (): OldBalanceSheet => ({
    type: BalanceSheetType.Compact,
    version: BalanceSheetVersion.v5_0_6,
    companyFacts: companyFactsJsonFactory.emptyRequest(),
    ratings: OldRatingsFactory.createDefaultRatings(
      BalanceSheetType.Compact,
      BalanceSheetVersion.v5_0_6
    ),
    stakeholderWeights: [],
  }),
  minimalCompactV506: () => ({
    type: BalanceSheetType.Compact,
    version: BalanceSheetVersion.v5_0_6,
  }),
};

export function makeCompanyFactsFactory() {
  function nonEmpty(): CompanyFacts {
    return makeCompanyFacts({
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
        makeSupplyFraction({
          industryCode: agricultureCode,
          countryCode: arabEmiratesCode,
          costs: 500,
        }),
        makeSupplyFraction({
          industryCode: pharmaceuticCode,
          countryCode: afghanistanCode,
          costs: 600,
        }),
      ],
      employeesFractions: [
        makeEmployeesFraction({
          countryCode: afghanistanCode,
          percentage: 0.5,
        }),
        makeEmployeesFraction({
          countryCode: arabEmiratesCode,
          percentage: 0.5,
        }),
      ],
      industrySectors: [],
      mainOriginOfOtherSuppliers: { countryCode: DEFAULT_COUNTRY_CODE },
    });
  }
  function nonEmpty2(): CompanyFacts {
    return makeCompanyFacts({
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
        makeSupplyFraction({
          industryCode: agricultureCode,
          countryCode: arabEmiratesCode,
          costs: 300,
        }),
        makeSupplyFraction({
          industryCode: pharmaceuticCode,
          countryCode: afghanistanCode,
          costs: 20,
        }),
      ],
      employeesFractions: [
        makeEmployeesFraction({
          countryCode: arabEmiratesCode,
          percentage: 0.3,
        }),
        makeEmployeesFraction({
          countryCode: afghanistanCode,
          percentage: 0.7,
        }),
      ],
      industrySectors: [],
      mainOriginOfOtherSuppliers: { countryCode: DEFAULT_COUNTRY_CODE },
    });
  }
  return deepFreeze({ nonEmpty, nonEmpty2 });
}

export const companyFactsFactory = {
  empty: (): OldCompanyFacts => ({
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
  emptyWithoutOptionalValues: (): OldCompanyFacts => ({
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
  nonEmpty: (): OldCompanyFacts => ({
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
  nonEmpty2: (): OldCompanyFacts => ({
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
  emptyRequest: (): any => ({
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
    mainOriginOfOtherSuppliers: 'AWO',
  }),
  emptyResponse: (): z.infer<typeof CompanyFactsResponseBodySchema> => ({
    ...companyFactsJsonFactory.emptyRequest(),
    mainOriginOfOtherSuppliers: { countryCode: 'AWO', costs: 0 },
  }),
  nonEmptyRequest: (): any => ({
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
    mainOriginOfOtherSuppliers: 'AWO',
  }),
};

export const WorkbookSectionsJsonFactory = {
  default: (): WorkbookSection[] => [
    {
      shortName: 'C',
      title: 'C. Employees, including co-working employers',
    },
    {
      shortName: 'C1',
      title: 'C1 Human dignity in the workplace and working environment ',
    },
    {
      shortName: 'C1.3',
      title: 'C1.3 Diversity and equal opportunities',
    },
  ],
};

export const StakeholderWeightsFactory = {
  default: (): OldStakeholderWeight[] => [
    { shortName: 'A', weight: 0.5 },
    { shortName: 'C', weight: 1.5 },
  ],
};

export const balanceSheetFactory = {
  emptyFullV508: (): OldBalanceSheet => ({
    type: BalanceSheetType.Full,
    version: BalanceSheetVersion.v5_0_8,
    companyFacts: companyFactsFactory.empty(),
    ratings: OldRatingsFactory.createDefaultRatings(
      BalanceSheetType.Full,
      BalanceSheetVersion.v5_0_8
    ),
    stakeholderWeights: [],
  }),
};

export const oldOrganizationFactory = {
  default: (): OldOrganization => ({
    name: 'My organization',
    address: {
      street: 'Example street',
      houseNumber: '28a',
      zip: '999999',
      city: 'Example city',
    },
    invitations: [],
  }),
};

export function makeOrganizationCreateRequest() {
  const data = {
    name: 'My organization',
    address: {
      street: 'Example street',
      houseNumber: '28a',
      zip: '999999',
      city: 'Example city',
    },
    invitations: [],
  };
  return deepFreeze({ ...data });
}
