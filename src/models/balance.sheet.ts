import { z } from 'zod';
import { CompanyFactsSchema } from './company.facts';
import { RatingSchema } from './rating';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { diff } from 'deep-diff';

export const BalanceSheetVersionSchema = z.nativeEnum(BalanceSheetVersion);
export const BalanceSheetSchema = z.object({
  type: z.nativeEnum(BalanceSheetType),
  version: BalanceSheetVersionSchema,
  companyFacts: CompanyFactsSchema,
  ratings: RatingSchema.array(),
});

export type BalanceSheet = z.infer<typeof BalanceSheetSchema>;
