import { z } from 'zod';
import { RatingResponseBodySchema } from 'e-calculator-schemas/dist/rating.dto';

export const RatingSchema = z.object({
  shortName: z.string(),
  name: z.string(),
  estimations: z.number(),
  points: z.number(),
  maxPoints: z.number(),
  weight: z.number(),
  isWeightSelectedByUser: z.boolean(),
  isPositive: z.boolean(),
});

export type Rating = z.infer<typeof RatingSchema>;

export function isTopicShortName(shortName: string): boolean {
  return shortName.length === 2;
}

export function isTopic(rating: Rating): boolean {
  return isTopicShortName(rating.shortName);
}

export function isAspectOfTopic(
  rating: Rating,
  shortNameTopic: string
): boolean {
  return isAspect(rating) && rating.shortName.startsWith(shortNameTopic);
}

export function isAspect(rating: Rating): boolean {
  return rating.shortName.length > 2;
}

export function filterTopics(ratings: Rating[]): Rating[] {
  return ratings.filter((rating) => isTopic(rating));
}

export function filterAspectsOfTopic(
  ratings: Rating[],
  shortNameTopic: string
): Rating[] {
  return ratings.filter((rating) => isAspectOfTopic(rating, shortNameTopic));
}

export function sortRatings(ratings: Rating[]): Rating[] {
  return [...ratings].sort((r1, r2) =>
    r1.shortName.localeCompare(r2.shortName)
  );
}

export type RatingResponseBody = z.infer<typeof RatingResponseBodySchema>;
