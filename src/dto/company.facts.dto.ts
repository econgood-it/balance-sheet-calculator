import { z } from 'zod';
import { DEFAULT_COUNTRY_CODE } from '../models/region';
import { computeCostsAndCreateMainOriginOfOtherSuppliers } from '../models/company.facts';

const isCountryCode = z.string().min(3).max(3);
const isIndustryCode = z.string().min(1).max(4);
const isCurrency = z.number().default(0);
const isNonNegativeCurrency = z.number().nonnegative().default(0);
const isPercentage = z.number().min(0).max(1);

export const CompanyFactsCreateRequestBody = z
  .object({
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
    supplyFractions: z
      .object({
        countryCode: isCountryCode,
        industryCode: isIndustryCode,
        costs: isNonNegativeCurrency,
      })
      .array()
      .default([]),
    employeesFractions: z
      .object({
        countryCode: isCountryCode,
        percentage: isPercentage,
      })
      .array()
      .default([]),
    industrySectors: z
      .object({
        industryCode: isIndustryCode,
        amountOfTotalTurnover: isPercentage,
        description: z.string().default(''),
      })
      .array()
      .default([]),
    mainOriginOfOtherSuppliers: isCountryCode.default(DEFAULT_COUNTRY_CODE),
  })
  .transform((cf) => ({
    ...cf,
    mainOriginOfOtherSuppliers: computeCostsAndCreateMainOriginOfOtherSuppliers(
      cf.mainOriginOfOtherSuppliers,
      cf.totalPurchaseFromSuppliers,
      cf.supplyFractions
    ),
  }));
