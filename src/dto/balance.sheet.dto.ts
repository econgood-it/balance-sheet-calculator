import { z } from 'zod';
import {
  CompanyFactsCreateRequestBodySchema,
  CompanyFactsPatchRequestBodySchema,
} from './company.facts.dto';
import { RatingRequestBody, RatingRequestBodySchema } from './rating.dto';
import { Rating } from '../models/rating';
import { BalanceSheetType, BalanceSheetVersion } from '../models/balance.sheet';
import { RatingsFactory } from '../factories/ratings.factory';
import { mergeRatingsWithRequestBodies } from '../merge/ratingsWithDtoMerger';

async function mergeWithDefaultRatings(
  ratingRequestBodies: RatingRequestBody[],
  type: BalanceSheetType,
  version: BalanceSheetVersion
): Promise<Rating[]> {
  const defaultRatings = await RatingsFactory.createDefaultRatings(
    type,
    version
  );
  return mergeRatingsWithRequestBodies(defaultRatings, ratingRequestBodies);
}

export const BalanceSheetCreateRequestBodySchema = z
  .object({
    type: z.nativeEnum(BalanceSheetType),
    version: z.nativeEnum(BalanceSheetVersion),
    companyFacts: CompanyFactsCreateRequestBodySchema.default({}),
    ratings: RatingRequestBodySchema.array().default([]),
  })
  .transform(async (b) => ({
    ...b,
    ratings: await mergeWithDefaultRatings(b.ratings, b.type, b.version),
  }));

export const BalanceSheetPatchRequestBodySchema = z.object({
  companyFacts: CompanyFactsPatchRequestBodySchema.optional(),
  ratings: RatingRequestBodySchema.array().default([]),
});

export type BalanceSheetPatchRequestBody = z.infer<
  typeof BalanceSheetPatchRequestBodySchema
>;
