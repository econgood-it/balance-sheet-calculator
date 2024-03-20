import deepFreeze from 'deep-freeze';
import { DEFAULT_COUNTRY_CODE } from './region';

export type SupplyFraction = {
  countryCode: string | undefined;
  industryCode: string | undefined;
  costs: number;
};

export function makeSupplyFraction(opts: SupplyFraction): SupplyFraction {
  return deepFreeze(opts);
}

export type EmployeesFraction = {
  countryCode: string | undefined;
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
  industryCode: string | undefined;
  amountOfTotalTurnover: number;
  description: string;
};

export function makeIndustrySector(opts: IndustrySector): IndustrySector {
  return deepFreeze({
    ...opts,
  });
}

export type MainOriginOfOtherSuppliers = {
  countryCode: string | undefined;
  costs: number;
};

export function makeMainOriginOfOtherSuppliers(
  opts?: MainOriginOfOtherSuppliers
): MainOriginOfOtherSuppliers {
  const { countryCode = DEFAULT_COUNTRY_CODE, costs = 0 } = opts || {};
  return deepFreeze({
    countryCode,
    costs,
  });
}

export type CompanyFacts = {
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
  mainOriginOfOtherSuppliers: MainOriginOfOtherSuppliers;
  supplyFractions: readonly SupplyFraction[];
  employeesFractions: readonly EmployeesFraction[];
  industrySectors: readonly IndustrySector[];
};

export function makeCompanyFacts(opts?: CompanyFacts): CompanyFacts {
  const {
    totalPurchaseFromSuppliers = 0,
    totalStaffCosts = 0,
    profit = 0,
    financialCosts = 0,
    incomeFromFinancialInvestments = 0,
    additionsToFixedAssets = 0,
    turnover = 0,
    totalAssets = 0,
    financialAssetsAndCashBalance = 0,
    numberOfEmployees = 0,
    isB2B = false,
    hasCanteen = false,
    averageJourneyToWorkForStaffInKm = 0,
    mainOriginOfOtherSuppliers = makeMainOriginOfOtherSuppliers(),
    supplyFractions = [],
    employeesFractions = [],
    industrySectors = [],
  } = opts || {};
  return deepFreeze({
    totalPurchaseFromSuppliers,
    totalStaffCosts,
    profit,
    financialCosts,
    incomeFromFinancialInvestments,
    additionsToFixedAssets,
    turnover,
    totalAssets,
    financialAssetsAndCashBalance,
    numberOfEmployees,
    hasCanteen,
    isB2B,
    averageJourneyToWorkForStaffInKm,
    mainOriginOfOtherSuppliers,
    supplyFractions,
    employeesFractions,
    industrySectors,
  });
}
