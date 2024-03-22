import { z } from 'zod';
import { CompanyFactsSchema } from './oldCompanyFacts';
import { RatingSchema } from './oldRating';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { StakeholderWeightSchema } from './oldStakeholderWeight';

export const BalanceSheetVersionSchema = z.nativeEnum(BalanceSheetVersion);
export const BalanceSheetSchema = z.object({
  type: z.nativeEnum(BalanceSheetType),
  version: BalanceSheetVersionSchema,
  companyFacts: CompanyFactsSchema,
  ratings: RatingSchema.array(),
  stakeholderWeights: StakeholderWeightSchema.array(),
});

export type OldBalanceSheet = z.infer<typeof BalanceSheetSchema>;
