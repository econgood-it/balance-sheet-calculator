import deepFreeze from 'deep-freeze';
import { DEFAULT_COUNTRY_CODE } from './region';
import _ from 'lodash';
import { CompanyFactsPatchRequestBodySchema } from '@ecogood/e-calculator-schemas/dist/company.facts.dto';
import { z } from 'zod';
import { decimalToPercentage, percentageToDecimal } from '../math';

export type SupplyFraction = {
  countryCode?: string;
  industryCode?: string;
  costs: number;
};

export function makeSupplyFraction(opts: SupplyFraction): SupplyFraction {
  return deepFreeze(opts);
}

export type EmployeesFraction = {
  countryCode?: string;
  percentage: number;
};

export function makeEmployeesFraction(
  opts: EmployeesFraction
): EmployeesFraction {
  return deepFreeze({
    ...opts,
  });
}

export type IndustrySector = {
  industryCode?: string;
  amountOfTotalTurnover: number;
  description: string;
};

export function makeIndustrySector(opts: IndustrySector): IndustrySector {
  return deepFreeze({
    ...opts,
  });
}

type MainOriginOfOtherSuppliersOpts = {
  countryCode?: string;
  totalPurchaseFromSuppliers: number;
  supplyFractions: readonly SupplyFraction[];
};

export type MainOriginOfOtherSuppliers = {
  countryCode?: string;
  costs: number;
};

export function makeMainOriginOfOtherSuppliers(
  opts: MainOriginOfOtherSuppliersOpts
): MainOriginOfOtherSuppliers {
  function computeCosts(
    totalPurchaseFromSuppliers: number,
    supplyFractions: readonly SupplyFraction[]
  ): number {
    const costs = supplyFractions.map((sf) => sf.costs);
    return (
      totalPurchaseFromSuppliers -
      costs.reduce(
        (sum: number, currentValue: number) => (sum += currentValue),
        0
      )
    );
  }

  return deepFreeze({
    ...opts,
    costs: computeCosts(opts.totalPurchaseFromSuppliers, opts.supplyFractions),
  });
}

type CompanyFactsOpts = {
  totalPurchaseFromSuppliers: number;
  totalStaffCosts: number;
  profit: number;
  financialCosts: number;
  incomeFromFinancialInvestments: number;
  additionsToFixedAssets: number;
  turnover: number;
  totalAssets: number;
  financialAssetsAndCashBalance: number;
  numberOfEmployees: number;
  hasCanteen?: boolean;
  isB2B: boolean;
  averageJourneyToWorkForStaffInKm: number;
  mainOriginOfOtherSuppliers: { countryCode?: string };
  supplyFractions: readonly SupplyFraction[];
  employeesFractions: readonly EmployeesFraction[];
  industrySectors: readonly IndustrySector[];
};

export type CompanyFacts = CompanyFactsOpts & {
  merge: (
    requestBody: z.infer<typeof CompanyFactsPatchRequestBodySchema>
  ) => CompanyFacts;
  areAllValuesZero: () => boolean;
  withFields: (fields: Partial<CompanyFactsOpts>) => CompanyFacts;
  mainOriginOfOtherSuppliers: MainOriginOfOtherSuppliers;
};

export function makeCompanyFacts(opts?: CompanyFactsOpts): CompanyFacts {
  const data = opts || {
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
    isB2B: false,
    hasCanteen: false,
    averageJourneyToWorkForStaffInKm: 0,
    mainOriginOfOtherSuppliers: makeMainOriginOfOtherSuppliers({
      totalPurchaseFromSuppliers: 0,
      countryCode: DEFAULT_COUNTRY_CODE,
      supplyFractions: [],
    }),
    supplyFractions: [],
    employeesFractions: [],
    industrySectors: [],
  };

  /**
   * =IF(AND($'2. Company Facts'.C7=0,$'2. Company Facts'.F10=0,$'2.
   * Company Facts'.F11=0,$'2. Company Facts'.F12=0,$'2.
   * Company Facts'.F13=0,$'2. Company Facts'.F14=0,$'2.
   * Company Facts'.C18=0,$'2. Company Facts'.C19=0,$'2.
   * Company Facts'.C20=0,$'2. Company Facts'.C21=0,$'2.
   * Company Facts'.C22=0,$'2. Company Facts'.C23=0,$'2.
   * Company Facts'.C26=0,$'2. Company Facts'.C27=0,$'2.
   * Company Facts'.D30=0,$'2. Company Facts'.D31=0,$'2.
   * Company Facts'.D32=0,$'2. Company Facts'.C33=0,$'2.
   * Company Facts'.C34=0,$'2. Company Facts'.C37=0,$'2.
   * Company Facts'.C38=0,$'2. Company Facts'.D41=0,$'2.
   * Company Facts'.D42=0,$'2. Company Facts'.D43=0),"empty","data")
   */
  function areAllValuesZero(obj: Record<string, any> = data): boolean {
    return _.every(obj, (value) => {
      if (_.isString(value)) {
        return true;
      } else if (_.isArray(value)) {
        return _.every(value, areAllValuesZero);
      } else if (_.isObject(value)) {
        return areAllValuesZero(value);
      } else {
        return value === 0 || value === false || value === undefined;
      }
    });
  }

  function withFields(fields: Partial<CompanyFactsOpts>): CompanyFacts {
    return makeCompanyFacts({ ...data, ...fields });
  }

  function merge(
    requestBody: z.infer<typeof CompanyFactsPatchRequestBodySchema>
  ): CompanyFacts {
    const supplyFractions =
      requestBody.supplyFractions?.map((sf) => makeSupplyFraction(sf)) ||
      data.supplyFractions;
    const employeesFractions =
      requestBody.employeesFractions?.map((ef) =>
        makeEmployeesFraction({
          ...ef,
          percentage: percentageToDecimal(ef.percentage),
        })
      ) || data.employeesFractions;
    const industrySectors =
      requestBody.industrySectors?.map((is) => makeIndustrySector(is)) ||
      data.industrySectors;
    const mainOriginOfOtherSuppliers = requestBody.mainOriginOfOtherSuppliers
      ? { countryCode: requestBody.mainOriginOfOtherSuppliers }
      : data.mainOriginOfOtherSuppliers;
    return makeCompanyFacts({
      ...data,
      ...requestBody,
      supplyFractions,
      employeesFractions,
      industrySectors,
      mainOriginOfOtherSuppliers,
    });
  }

  return deepFreeze({
    ...data,
    mainOriginOfOtherSuppliers: makeMainOriginOfOtherSuppliers({
      totalPurchaseFromSuppliers: data.totalPurchaseFromSuppliers,
      countryCode: data.mainOriginOfOtherSuppliers.countryCode,
      supplyFractions: data.supplyFractions,
    }),
    areAllValuesZero,
    withFields,
    merge,
  });
}
