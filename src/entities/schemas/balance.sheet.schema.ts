import { z } from 'zod';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { CompanyFactsDBSchema } from './company.facts.schema';
import { RatingDBSchema } from './rating.schema';
import { StakeholderWeightDBSchema } from './stakeholder.weight.schema';

const BalanceSheetVersionSchema = z.nativeEnum(BalanceSheetVersion);
export const BalanceSheetDBSchema = z.object({
  type: z.nativeEnum(BalanceSheetType),
  version: BalanceSheetVersionSchema,
  companyFacts: CompanyFactsDBSchema,
  ratings: RatingDBSchema.array(),
  stakeholderWeights: StakeholderWeightDBSchema.array(),
});
export type BalanceSheetDB = z.infer<typeof BalanceSheetDBSchema>;
