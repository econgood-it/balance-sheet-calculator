import { z } from 'zod';
import {
  CompanyFactsCreateRequestBody,
  CompanyFactsCreateRequestBodyTransformedSchema,
  CompanyFactsPatchRequestBodySchema,
  CompanyFactsResponseBodySchema,
} from './company.facts.dto';
import {
  RatingRequestBody,
  RatingRequestBodySchema,
  RatingResponseBodySchema,
} from './rating.dto';
import { isTopic, Rating, sortRatings } from '../models/rating';
import {
  BalanceSheet,
  BalanceSheetType,
  BalanceSheetVersion,
} from '../models/balance.sheet';
import { RatingsFactory } from '../factories/ratings.factory';
import { mergeRatingsWithRequestBodies } from '../merge/ratingsWithDtoMerger';
import { translateBalanceSheet, Translations } from '../language/translations';

function mergeWithDefaultRatings(
  ratingRequestBodies: RatingRequestBody[],
  type: BalanceSheetType,
  version: BalanceSheetVersion
): Rating[] {
  const defaultRatings = RatingsFactory.createDefaultRatings(type, version);
  return mergeRatingsWithRequestBodies(defaultRatings, ratingRequestBodies);
}

export const BalanceSheetCreateRequestBodySchema = z.object({
  type: z.nativeEnum(BalanceSheetType),
  version: z.nativeEnum(BalanceSheetVersion),
  companyFacts: CompanyFactsCreateRequestBody.default({}),
  ratings: RatingRequestBodySchema.array().default([]),
});

export const BalanceSheetCreateRequestBodyTransformedSchema =
  BalanceSheetCreateRequestBodySchema.transform((b) => ({
    ...b,
    companyFacts: CompanyFactsCreateRequestBodyTransformedSchema.parse(
      b.companyFacts
    ),
    ratings: mergeWithDefaultRatings(b.ratings, b.type, b.version),
  }));

export const BalanceSheetPatchRequestBodySchema = z.object({
  companyFacts: CompanyFactsPatchRequestBodySchema.optional(),
  ratings: RatingRequestBodySchema.array().default([]),
});

export type BalanceSheetPatchRequestBody = z.infer<
  typeof BalanceSheetPatchRequestBodySchema
>;

export const BalanceSheetResponseBodySchema = z.object({
  id: z.number().optional(),
  type: z.nativeEnum(BalanceSheetType),
  version: z.nativeEnum(BalanceSheetVersion),
  ratings: RatingResponseBodySchema.array(),
  companyFacts: CompanyFactsResponseBodySchema,
});

export function balanceSheetToResponse(
  id: number | undefined,
  balanceSheet: BalanceSheet,
  language: keyof Translations
) {
  const transBalanceSheet = translateBalanceSheet(balanceSheet, language);
  return BalanceSheetResponseBodySchema.parse({
    id,
    ...transBalanceSheet,
    ratings: sortRatings(
      transBalanceSheet.ratings.map((r) => ({
        ...r,
        type: isTopic(r) ? 'topic' : 'aspect',
      }))
    ),
  });
}

export const BalanceSheetIdsResponseSchema = z
  .object({
    id: z.number(),
  })
  .array();
