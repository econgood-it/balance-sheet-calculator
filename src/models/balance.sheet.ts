import { z } from 'zod';
import {
  CompanyFactsCreateRequestBodyTransformedSchema,
  CompanyFactsSchema,
  companyFactsToResponse,
} from './company.facts';
import {
  filterTopics,
  isTopic,
  Rating,
  RatingSchema,
  sortRatings,
} from './rating';
import { RatingsFactory } from '../factories/ratings.factory';
import { mergeRatingsWithRequestBodies } from '../merge/ratingsWithDtoMerger';
import { translateBalanceSheet, Translations } from '../language/translations';
import {
  BalanceSheetCreateRequestBodySchema,
  BalanceSheetResponseBodySchema,
} from '@ecogood/e-calculator-schemas/dist/balance.sheet.dto';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { RatingRequestBodySchema } from '@ecogood/e-calculator-schemas/dist/rating.dto';
import { none, Option, some } from '../calculations/option';
import { roundWithPrecision } from '../math';
import { MatrixBodySchema } from '@ecogood/e-calculator-schemas/dist/matrix.dto';
import { diff } from 'deep-diff';
import { calculateTotalPoints } from '../calculations/calculator';
import { BalanceSheetEntity } from '../entities/balance.sheet.entity';

export const BalanceSheetVersionSchema = z.nativeEnum(BalanceSheetVersion);
export const BalanceSheetSchema = z.object({
  type: z.nativeEnum(BalanceSheetType),
  version: BalanceSheetVersionSchema,
  companyFacts: CompanyFactsSchema,
  ratings: RatingSchema.array(),
});

export type BalanceSheet = z.infer<typeof BalanceSheetSchema>;

export namespace BalanceSheetParser {
  function mergeWithDefaultRatings(
    ratingRequestBodies: z.infer<typeof RatingRequestBodySchema>[],
    type: BalanceSheetType,
    version: BalanceSheetVersion
  ): Rating[] {
    const defaultRatings = RatingsFactory.createDefaultRatings(type, version);
    return mergeRatingsWithRequestBodies(defaultRatings, ratingRequestBodies);
  }

  export function fromJson(
    json: z.input<typeof BalanceSheetCreateRequestBodySchema>
  ): BalanceSheet {
    return BalanceSheetCreateRequestBodySchema.transform((b) => ({
      ...b,
      companyFacts: CompanyFactsCreateRequestBodyTransformedSchema.parse(
        b.companyFacts
      ),
      ratings: mergeWithDefaultRatings(b.ratings, b.type, b.version),
    }))
      .pipe(BalanceSheetSchema)
      .parse(json);
  }

  export function toJson(
    id: number | undefined,
    balanceSheet: BalanceSheet,
    language: keyof Translations
  ) {
    const transBalanceSheet = translateBalanceSheet(balanceSheet, language);
    return BalanceSheetResponseBodySchema.parse({
      id,
      ...transBalanceSheet,
      companyFacts: companyFactsToResponse(transBalanceSheet.companyFacts),
      ratings: sortRatings(
        transBalanceSheet.ratings.map((r) => ({
          ...r,
          type: isTopic(r) ? 'topic' : 'aspect',
        }))
      ),
    });
  }
}

type MatrixBody = z.infer<typeof MatrixBodySchema>;

export function balanceSheetToMatrixResponse(
  balanceSheet: BalanceSheet
): MatrixBody {
  return MatrixBodySchema.parse({
    ratings: filterTopics(sortRatings(balanceSheet.ratings)).map((r) =>
      ratingToMatrixRating(r)
    ),
    totalPoints: calculateTotalPoints(balanceSheet.ratings),
  });
}

export function ratingToMatrixRating(rating: Rating) {
  const percentage = calcPercentage(rating.points, rating.maxPoints);
  const percentageReached = percentage.isPresent()
    ? percentage.get()
    : undefined;
  return {
    shortName: rating.shortName,
    name: rating.name,
    points: roundWithPrecision(rating.points),
    maxPoints: roundWithPrecision(rating.maxPoints),
    percentageReached,
    notApplicable: notApplicable(rating.weight),
  };
}

function calcPercentage(points: number, maxPoints: number): Option<number> {
  if (maxPoints === 0 || points < 0) {
    return none();
  }
  return some(roundWithPrecision(points / maxPoints, 1) * 100);
}

function notApplicable(weight: number): boolean {
  return weight === 0;
}

export const diffBetweenBalanceSheets = (
  balanceSheet: BalanceSheet,
  otherBalanceSheet: BalanceSheet
) => {
  const differences = diff(balanceSheet, otherBalanceSheet);
  return differences?.map((d) =>
    d.path && d.path.length >= 2 && d.path[0] === 'ratings'
      ? {
          ...d,
          shortName: balanceSheet.ratings[d.path[1]].shortName,
        }
      : d
  );
};
