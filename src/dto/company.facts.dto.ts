import { z } from 'zod';
import {
  computeCostsAndCreateMainOriginOfOtherSuppliers,
  isCountryCode,
  isIndustryCode,
} from '../models/company.facts';

const isCurrency = z.number().default(0);
const isNonNegativeCurrency = z.number().nonnegative().default(0);
const isPercentage = z.number().min(0).max(1);

const SupplyFractionRequestBodySchema = z.object({
  countryCode: isCountryCode.optional(),
  industryCode: isIndustryCode.optional(),
  costs: isNonNegativeCurrency,
});

const EmployeesFractionRequestBodySchema = z.object({
  countryCode: isCountryCode.optional(),
  percentage: isPercentage,
});

const IndustrySectorRequestBodySchema = z.object({
  industryCode: isIndustryCode.optional(),
  amountOfTotalTurnover: isPercentage,
  description: z.string().default(''),
});

const CompanyFactsRequestBodySchema = z.object({
  totalPurchaseFromSuppliers: isNonNegativeCurrency,
  totalStaffCosts: isNonNegativeCurrency,
  profit: isCurrency,
  financialCosts: isNonNegativeCurrency,
  incomeFromFinancialInvestments: isCurrency,
  additionsToFixedAssets: isCurrency,
  turnover: isNonNegativeCurrency,
  totalAssets: isNonNegativeCurrency,
  financialAssetsAndCashBalance: isNonNegativeCurrency,
  numberOfEmployees: isNonNegativeCurrency,
  hasCanteen: z.oboolean(),
  averageJourneyToWorkForStaffInKm: z.number().default(0),
  isB2B: z.boolean().default(false),
  supplyFractions: SupplyFractionRequestBodySchema.array().default([]),
  employeesFractions: EmployeesFractionRequestBodySchema.array().default([]),
  industrySectors: IndustrySectorRequestBodySchema.array().default([]),
  mainOriginOfOtherSuppliers: isCountryCode.optional(),
});

export const CompanyFactsCreateRequestBodySchema =
  CompanyFactsRequestBodySchema.transform((cf) => ({
    ...cf,
    mainOriginOfOtherSuppliers: computeCostsAndCreateMainOriginOfOtherSuppliers(
      cf.mainOriginOfOtherSuppliers,
      cf.totalPurchaseFromSuppliers,
      cf.supplyFractions
    ),
  }));

export const CompanyFactsPatchRequestBodySchema =
  CompanyFactsRequestBodySchema.partial();

export type CompanyFactsPatchRequestBody = z.infer<
  typeof CompanyFactsPatchRequestBodySchema
>;

export const CompanyFactsResponseBodySchema = z.object({
  totalPurchaseFromSuppliers: isNonNegativeCurrency,
  totalStaffCosts: isNonNegativeCurrency,
  profit: isCurrency,
  financialCosts: isNonNegativeCurrency,
  incomeFromFinancialInvestments: isCurrency,
  additionsToFixedAssets: isCurrency,
  turnover: isNonNegativeCurrency,
  totalAssets: isNonNegativeCurrency,
  financialAssetsAndCashBalance: isNonNegativeCurrency,
  numberOfEmployees: isNonNegativeCurrency,
  hasCanteen: z.oboolean(),
  averageJourneyToWorkForStaffInKm: z.number(),
  isB2B: z.boolean(),
  supplyFractions: SupplyFractionRequestBodySchema.array(),
  employeesFractions: EmployeesFractionRequestBodySchema.array(),
  industrySectors: IndustrySectorRequestBodySchema.array(),
  mainOriginOfOtherSuppliers: z.object({
    countryCode: isCountryCode.optional(),
    costs: z.number(),
  }),
});
