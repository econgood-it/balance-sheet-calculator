import { DEFAULT_COUNTRY_CODE } from '../models/region';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';

import { WorkbookSection } from '../models/workbook';
import { z } from 'zod';
import { CompanyFactsResponseBodySchema } from '@ecogood/e-calculator-schemas/dist/company.facts.dto';
import deepFreeze from 'deep-freeze';
import {
  CompanyFacts,
  makeCompanyFacts,
  makeEmployeesFraction,
  makeSupplyFraction,
} from '../models/company.facts';
import { BalanceSheetCreateRequestBodySchema } from '@ecogood/e-calculator-schemas/dist/balance.sheet.dto';
import { makeRatingFactory } from '../factories/rating.factory';
import { OrganizationRequestSchema } from '@ecogood/e-calculator-schemas/dist/organization.dto';

const arabEmiratesCode = 'ARE';
const afghanistanCode = 'AFG';
const agricultureCode = 'A';
const pharmaceuticCode = 'Ce';

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

export function makeJsonFactory() {
  function emptyFullV508() {
    return {
      type: BalanceSheetType.Full,
      version: BalanceSheetVersion.v5_0_8,
      companyFacts: emptyCompanyFacts(),
      ratings: makeRatingFactory().createDefaultRatings(
        BalanceSheetType.Full,
        BalanceSheetVersion.v5_0_8
      ),
      stakeholderWeights: [],
    };
  }

  function emptyCompactV506() {
    return {
      type: BalanceSheetType.Compact,
      version: BalanceSheetVersion.v5_0_6,
      companyFacts: emptyCompanyFacts(),
      ratings: makeRatingFactory().createDefaultRatings(
        BalanceSheetType.Compact,
        BalanceSheetVersion.v5_0_6
      ),
      stakeholderWeights: [],
    };
  }

  function minimalCompactV506() {
    return {
      type: BalanceSheetType.Compact,
      version: BalanceSheetVersion.v5_0_6,
    };
  }

  function emptyCompanyFacts() {
    return {
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
    };
  }
  return deepFreeze({
    emptyFullV508,
    minimalCompactV506,
    emptyCompactV506,
    emptyCompanyFacts,
  });
}

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

export const organizationJsonFactory = {
  default: (): z.infer<typeof OrganizationRequestSchema> => ({
    name: 'My organization',
    address: {
      street: 'Example street',
      houseNumber: '28a',
      zip: '999999',
      city: 'Example city',
    },
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
