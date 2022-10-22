import { z } from 'zod';
import { SupplyFractionDTOCreate } from '../dto/create/supply.fraction.create.dto';
import { enumMapperByValue } from '@daniel-faber/json-ts';

const SupplyFractionSchema = z.object({
  countryCode: z.string(),
  industryCode: z.string(),
  costs: z.number(),
});

export type SupplyFraction = z.infer<typeof SupplyFractionSchema>;

const EmployeesFractionSchema = z.object({
  countryCode: z.string(),
  percentage: z.number(),
});

export type EmployeesFraction = z.infer<typeof EmployeesFractionSchema>;

const IndustrySectorSchema = z.object({
  industryCode: z.string(),
  amountOfTotalTurnover: z.number(),
  description: z.string(),
});

export type IndustrySector = z.infer<typeof IndustrySectorSchema>;

const MainOriginOfOtherSuppliersSchema = z.object({
  countryCode: z.string(),
  costs: z.number(),
});

export type MainOriginOfOtherSuppliers = z.infer<
  typeof MainOriginOfOtherSuppliersSchema
>;

export const CompanyFactsSchema = z.object({
  totalPurchaseFromSuppliers: z.number(),
  totalStaffCosts: z.number(),
  profit: z.number(),
  financialCosts: z.number(),
  incomeFromFinancialInvestments: z.number(),
  additionsToFixedAssets: z.number(),
  turnover: z.number(),
  totalAssets: z.number(),
  financialAssetsAndCashBalance: z.number(),
  numberOfEmployees: z.number(),
  hasCanteen: z.boolean(),
  isB2B: z.boolean(),
  averageJourneyToWorkForStaffInKm: z.number(),
  mainOriginOfOtherSuppliers: MainOriginOfOtherSuppliersSchema,
  supplyFractions: SupplyFractionSchema.array(),
  employeesFractions: EmployeesFractionSchema.array(),
  industrySectors: IndustrySectorSchema.array(),
});

export type CompanyFacts = z.infer<typeof CompanyFactsSchema>;

export const RatingSchema = z.object({
  shortName: z.string(),
  name: z.string(),
  estimations: z.number(),
  points: z.number(),
  maxPoints: z.number(),
  weight: z.number(),
  isWeightSelectedByUser: z.boolean(),
  isPositive: z.boolean(),
});

export type Rating = z.infer<typeof RatingSchema>;

export function isTopicShortName(shortName: string): boolean {
  return shortName.length === 2;
}

export function isTopic(rating: Rating): boolean {
  return isTopicShortName(rating.shortName);
}

export function isAspectOfTopic(
  rating: Rating,
  shortNameTopic: string
): boolean {
  return isAspect(rating) && rating.shortName.startsWith(shortNameTopic);
}

export function isAspect(rating: Rating): boolean {
  return rating.shortName.length > 2;
}

export enum BalanceSheetType {
  Compact = 'Compact',
  Full = 'Full',
  Other = 'other',
}

export const balanceSheetTypeFromJSON =
  enumMapperByValue<BalanceSheetType>(BalanceSheetType);

export enum BalanceSheetVersion {
  // eslint-disable-next-line camelcase
  v5_0_4 = '5.04',
  // eslint-disable-next-line camelcase
  v5_0_5 = '5.05',
  // eslint-disable-next-line camelcase
  v5_0_6 = '5.06',
  // eslint-disable-next-line camelcase
  v5_0_7 = '5.07',
  // eslint-disable-next-line camelcase
  v5_0_8 = '5.08',
}

export const balanceSheetVersionFromJSON =
  enumMapperByValue<BalanceSheetVersion>(BalanceSheetVersion);
export const BalanceSheetSchema = z.object({
  type: z.nativeEnum(BalanceSheetType),
  version: z.nativeEnum(BalanceSheetVersion),
  companyFacts: CompanyFactsSchema,
  ratings: RatingSchema.array(),
});

export type BalanceSheet = z.infer<typeof BalanceSheetSchema>;
export const INDUSTRY_CODE_FOR_FINANCIAL_SERVICES = 'K';
export const INDUSTRY_CODE_FOR_MINING = 'B';
export const INDUSTRY_CODE_FOR_CONSTRUCTION_INDUSTRY = 'F';
export const computeCostsOfMainOriginOfOtherSuppliers = (
  totalPurchaseFromSuppliers: number,
  supplyFractions: SupplyFractionDTOCreate[] | SupplyFraction[]
): number => {
  const costs = supplyFractions.map((sf) => sf.costs);
  return (
    totalPurchaseFromSuppliers -
    costs.reduce(
      (sum: number, currentValue: number) => (sum += currentValue),
      0
    )
  );
};
export const computeCostsAndCreateMainOriginOfOtherSuppliers = (
  countryCode: string,
  totalPurchaseFromSuppliers: number,
  supplyFractions: SupplyFractionDTOCreate[]
): MainOriginOfOtherSuppliers => {
  return {
    countryCode: countryCode,
    costs: computeCostsOfMainOriginOfOtherSuppliers(
      totalPurchaseFromSuppliers,
      supplyFractions
    ),
  };
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
export function allValuesAreZero(companyFacts: CompanyFacts): boolean {
  if (
    [
      companyFacts.totalPurchaseFromSuppliers,
      ...companyFacts.supplyFractions.map((sf) => sf.costs),
      companyFacts.profit,
      companyFacts.financialCosts,
      companyFacts.incomeFromFinancialInvestments,
      companyFacts.totalAssets,
      companyFacts.additionsToFixedAssets,
      companyFacts.financialAssetsAndCashBalance,
      companyFacts.numberOfEmployees,
      companyFacts.totalStaffCosts,
      ...companyFacts.employeesFractions.map((ef) => ef.percentage),
      companyFacts.averageJourneyToWorkForStaffInKm,
      companyFacts.turnover,
      ...companyFacts.industrySectors.map((is) => is.amountOfTotalTurnover),
    ].every(
      (value) =>
        value === 0 &&
        [companyFacts.isB2B, companyFacts.hasCanteen].every(
          (value) => value === false
        )
    )
  ) {
    return true;
  }
  return false;
}

export function filterTopics(ratings: Rating[]): Rating[] {
  return ratings.filter((rating) => isTopic(rating));
}

export function filterAspectsOfTopic(
  ratings: Rating[],
  shortNameTopic: string
): Rating[] {
  return ratings.filter((rating) => isAspectOfTopic(rating, shortNameTopic));
}

export function sortRatings(ratings: Rating[]): Rating[] {
  return [...ratings].sort((r1, r2) =>
    r1.shortName.localeCompare(r2.shortName)
  );
}
