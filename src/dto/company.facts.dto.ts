import { z } from 'zod';
import { DEFAULT_COUNTRY_CODE } from '../models/region';
import { computeCostsAndCreateMainOriginOfOtherSuppliers } from '../models/company.facts';

const isCountryCode = z.string().min(3).max(3);
const isIndustryCode = z.string().min(1).max(4);
const isCurrency = z.number().default(0);
const isNonNegativeCurrency = z.number().nonnegative().default(0);
const isPercentage = z.number().min(0).max(1);

const SupplyFractionRequestBodySchema = z.object({
  countryCode: isCountryCode,
  industryCode: isIndustryCode,
  costs: isNonNegativeCurrency,
});

export type SupplyFractionRequestBody = z.infer<
  typeof SupplyFractionRequestBodySchema
>;

const EmployeesFractionRequestBodySchema = z.object({
  countryCode: isCountryCode,
  percentage: isPercentage,
});

export type EmployeesFractionRequestBody = z.infer<
  typeof EmployeesFractionRequestBodySchema
>;

const IndustrySectorRequestBodySchema = z.object({
  industryCode: isIndustryCode,
  amountOfTotalTurnover: isPercentage,
  description: z.string().default(''),
});

export type IndustrySectorRequestBody = z.infer<
  typeof IndustrySectorRequestBodySchema
>;

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
  hasCanteen: z.boolean().default(false),
  averageJourneyToWorkForStaffInKm: z.number().default(0),
  isB2B: z.boolean().default(false),
  supplyFractions: SupplyFractionRequestBodySchema.array().default([]),
  employeesFractions: EmployeesFractionRequestBodySchema.array().default([]),
  industrySectors: IndustrySectorRequestBodySchema.array().default([]),
  mainOriginOfOtherSuppliers: isCountryCode.default(DEFAULT_COUNTRY_CODE),
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
