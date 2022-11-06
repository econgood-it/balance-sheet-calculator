import { BalanceSheet } from '../models/balance.sheet';
import { filterTopics, Rating, sortRatings } from '../models/rating';
import { z } from 'zod';
import { none, Option, some } from '../calculations/option';
import { roundWithPrecision } from '../math';

const MatrixRatingBodySchema = z.object({
  shortName: z.string(),
  name: z.string(),
  points: z.number(),
  maxPoints: z.number(),
  percentageReached: z.number().optional(),
  notApplicable: z.boolean(),
});

type MatrixRatingBody = z.infer<typeof MatrixRatingBodySchema>;

const MatrixResponseBodySchema = z.object({
  ratings: MatrixRatingBodySchema.array(),
});

export function balanceSheetToMatrixResponse(balanceSheet: BalanceSheet) {
  return MatrixResponseBodySchema.parse({
    ratings: filterTopics(sortRatings(balanceSheet.ratings)).map((r) =>
      ratingToMatrixRating(r)
    ),
  });
}

export function ratingToMatrixRating(rating: Rating): MatrixRatingBody {
  const percentage = calcPercentage(rating.points, rating.maxPoints);
  const percentageReached = percentage.isPresent()
    ? percentage.get()
    : undefined;
  return MatrixRatingBodySchema.parse({
    shortName: rating.shortName,
    name: rating.name,
    points: roundWithPrecision(rating.points),
    maxPoints: roundWithPrecision(rating.maxPoints),
    percentageReached: percentageReached,
    notApplicable: notApplicable(rating.weight),
  });
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
