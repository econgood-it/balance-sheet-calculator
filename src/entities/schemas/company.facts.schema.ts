import { z } from 'zod';
import {
  isCountryCode,
  isIndustryCode,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';

const isPercentage = z.number().min(0).max(1);

const SupplyFractionDBSchema = z.object({
  countryCode: isCountryCode.optional(),
  industryCode: isIndustryCode.optional(),
  costs: z.number(),
});

const EmployeesFractionDBSchema = z.object({
  countryCode: isCountryCode.optional(),
  percentage: isPercentage,
});

const IndustrySectorDBSchema = z.object({
  industryCode: isIndustryCode.optional(),
  amountOfTotalTurnover: isPercentage,
  description: z.string(),
});

const MainOriginOfOtherSuppliersDBSchema = z.object({
  countryCode: isCountryCode.optional(),
  costs: z.number(),
});

export const CompanyFactsDBSchema = z.object({
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
  hasCanteen: z.boolean().optional(),
  isB2B: z.boolean(),
  averageJourneyToWorkForStaffInKm: z.number(),
  mainOriginOfOtherSuppliers: MainOriginOfOtherSuppliersDBSchema,
  supplyFractions: SupplyFractionDBSchema.array(),
  employeesFractions: EmployeesFractionDBSchema.array(),
  industrySectors: IndustrySectorDBSchema.array(),
});
