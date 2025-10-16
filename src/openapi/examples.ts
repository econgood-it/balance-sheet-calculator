import { DEFAULT_COUNTRY_CODE } from '../models/region';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { z } from 'zod';
import deepFreeze from 'deep-freeze';
import {
  CompanyFacts,
  makeCompanyFacts,
  makeEmployeesFraction,
  makeSupplyFraction,
} from '../models/company.facts';
import { OrganizationRequestSchema } from '@ecogood/e-calculator-schemas/dist/organization.dto';
import { generalInformationDummy } from '../../tests/models/general.information.dummy';

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
      generalInformation: { ...generalInformationDummy },
      ratings: [
        {
          shortName: 'A1',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'A1.1',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'A1.2',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'A2',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'A2.1',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'A2.2',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'A2.3',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'A3',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'A3.1',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'A3.2',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'A4',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'A4.1',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'A4.2',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'B1',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'B1.1',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'B1.2',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'B1.3',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'B2',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'B2.1',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'B2.2',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'B3',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'B3.1',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'B3.2',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'B3.3',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'B4',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'B4.1',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'B4.2',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'C1',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'C1.1',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'C1.2',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'C1.3',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'C1.4',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'C2',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'C2.1',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'C2.2',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'C2.3',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'C2.4',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'C3',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'C3.1',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'C3.2',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'C3.3',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'C3.4',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'C4',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'C4.1',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'C4.2',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'C4.3',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'C4.4',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'D1',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'D1.1',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'D1.2',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'D1.3',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'D2',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'D2.1',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'D2.2',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'D2.3',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'D3',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'D3.1',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'D3.2',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'D3.3',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'D4',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'D4.1',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'D4.2',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'D4.3',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'E1',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'E1.1',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'E1.2',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'E1.3',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'E2',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'E2.1',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'E2.2',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'E2.3',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'E2.4',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'E3',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'E3.1',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'E3.2',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'E3.3',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'E4',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'E4.1',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'E4.2',
          estimations: 0,
          weight: 1,
        },
        {
          shortName: 'E4.3',
          estimations: 0,
          weight: 1,
        },
      ],
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
    emptyCompanyFacts,
  });
}

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

export function makeWorkbookResponse() {
  const data = {
    version: BalanceSheetVersion.v5_1_0,
    type: BalanceSheetType.Full,
    groups: [
      { shortName: 'A', name: 'Lieferant*innen' },
      {
        shortName: 'B',
        name: 'Eigentümer*innen und Finanzpartner*innen',
      },
      { shortName: 'C', name: 'Mitarbeitende' },
      { shortName: 'D', name: 'Kund*innen und Mitunternehmen' },
      { shortName: 'E', name: 'Gesellschaftliches Umfeld' },
    ],
  };
  return deepFreeze({ ...data });
}

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
