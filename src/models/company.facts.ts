import { z } from 'zod';
export const isCountryCode = z.string().min(3).max(3);
const SupplyFractionSchema = z.object({
  countryCode: isCountryCode.optional(),
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
  countryCode: isCountryCode.optional(),
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
export const computeCostsOfMainOriginOfOtherSuppliers = (
  totalPurchaseFromSuppliers: number,
  supplyFractions: SupplyFraction[]
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
  countryCode: string | undefined,
  totalPurchaseFromSuppliers: number,
  supplyFractions: SupplyFraction[]
): MainOriginOfOtherSuppliers => {
  return {
    countryCode,
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

export const INDUSTRY_CODE_FOR_FINANCIAL_SERVICES = 'K';
export const INDUSTRY_CODE_FOR_MINING = 'B';
export const INDUSTRY_CODE_FOR_CONSTRUCTION_INDUSTRY = 'F';
