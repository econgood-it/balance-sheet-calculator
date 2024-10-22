import deepFreeze from 'deep-freeze';
import { ValueError } from '../exceptions/value.error';
import { z } from 'zod';
import {
  RatingRequestBodySchema,
  RatingResponseBodySchema,
} from '@ecogood/e-calculator-schemas/dist/rating.dto';
import { staticTranslate, Translations } from '../language/translations';
import { MatrixRatingBodySchema } from '@ecogood/e-calculator-schemas/dist/matrix.dto';
import { roundWithPrecision } from '../math';
import { none, Option, some } from '../calculations/option';
import { LookupError } from '../exceptions/lookup.error';

type RatingOpts = {
  shortName: string;
  name: string;
  estimations: number;
  points: number;
  maxPoints: number;
  weight: number;
  isWeightSelectedByUser: boolean;
  isPositive: boolean;
};

export type Rating = RatingOpts & {
  merge: (
    requestBody: z.infer<typeof RatingRequestBodySchema>,
    defaultWeight: number
  ) => Rating;
  toJson: (
    language: keyof Translations
  ) => z.infer<typeof RatingResponseBodySchema>;
  isTopic: () => boolean;
  isAspect: () => boolean;
  isAspectOfTopic: (shortNameTopic: string) => boolean;
  submitEstimations: (estimations: number) => Rating;
  getStakeholderName: () => string;
  toMatrixFormat: (
    language: keyof Translations
  ) => z.infer<typeof MatrixRatingBodySchema>;
};

export function makeRating(opts?: RatingOpts): Rating {
  const data = opts || {
    shortName: 'A1',
    name: 'Human dignity in the supply chain',
    estimations: 0,
    points: 0,
    maxPoints: 0,
    weight: 0,
    isWeightSelectedByUser: false,
    isPositive: true,
  };

  if (
    isAspect() &&
    data.isPositive &&
    !z.number().min(0).max(10).safeParse(data.estimations).success
  ) {
    throw new ValueError(
      'Estimations have to be withing [0, 10] for positive ratings'
    );
  }
  if (
    isAspect() &&
    !data.isPositive &&
    !z.number().min(-200).max(0).safeParse(data.estimations).success
  ) {
    throw new ValueError(
      'Estimations have to be within [-200, 0] for negative ratings'
    );
  }

  function isTopic(): boolean {
    return isTopicShortName();
  }

  function isAspect(): boolean {
    return !isTopicShortName();
  }

  function isAspectOfTopic(shortNameTopic: string): boolean {
    return isAspect() && data.shortName.startsWith(shortNameTopic);
  }

  function isTopicShortName(): boolean {
    return data.shortName.length === 2;
  }

  function submitEstimations(estimations: number): Rating {
    return makeRating({ ...data, estimations });
  }

  function getStakeholderName(): string {
    return data.shortName.substring(0, 1);
  }

  function adjustWeight(defaultWeight: number, weight?: number): Rating {
    if (data.isPositive && weight !== undefined) {
      return makeRating({ ...data, weight, isWeightSelectedByUser: true });
    } else {
      return makeRating({
        ...data,
        isWeightSelectedByUser: false,
        weight: defaultWeight, // TODO: Get default weight from factory especially for version 5.10
      });
    }
  }

  function merge(
    requestBody: z.infer<typeof RatingRequestBodySchema>,
    defaultWeight: number
  ): Rating {
    return adjustWeight(defaultWeight, requestBody.weight).submitEstimations(
      requestBody.estimations || data.estimations
    );
  }

  function toMatrixFormat(
    language: keyof Translations
  ): z.infer<typeof MatrixRatingBodySchema> {
    const percentage = calcPercentage();
    const percentageReached = percentage.isPresent()
      ? percentage.get()
      : undefined;
    return MatrixRatingBodySchema.parse({
      shortName: data.shortName,
      name: staticTranslate(language, data.name),
      points: roundWithPrecision(data.points),
      maxPoints: roundWithPrecision(data.maxPoints),
      percentageReached,
      notApplicable: notApplicable(),
    });
  }

  function calcPercentage(): Option<number> {
    if (data.maxPoints === 0 || data.points < 0) {
      return none();
    }
    return some(roundWithPrecision(data.points / data.maxPoints, 1) * 100);
  }

  function notApplicable(): boolean {
    return data.weight === 0;
  }

  function toJson(
    language: keyof Translations
  ): z.infer<typeof RatingResponseBodySchema> {
    return RatingResponseBodySchema.parse({
      shortName: data.shortName,
      name: staticTranslate(language, data.name),
      type: isTopic() ? 'topic' : 'aspect',
      isPositive: data.isPositive,
      estimations: data.estimations,
      weight: data.weight,
      isWeightSelectedByUser: data.isWeightSelectedByUser,
      points: data.points,
      maxPoints: data.maxPoints,
    });
  }

  return deepFreeze({
    ...data,
    isTopic,
    isAspect,
    isAspectOfTopic,
    submitEstimations,
    getStakeholderName,
    merge,
    toJson,
    toMatrixFormat,
  });
}

type RatingsQuery = {
  getRating: (shortName: string) => Rating;
  getAspects: (shortNameTopic?: string) => Rating[];
};

export function makeRatingsQuery(ratings: readonly Rating[]): RatingsQuery {
  function getRating(shortName: string): Rating {
    const rating = ratings.find((rating) => rating.shortName === shortName);
    if (!rating) {
      throw new LookupError(`Rating with shortName ${shortName} not found`);
    }
    return rating;
  }
  function getAspects(shortNameTopic?: string) {
    const aspects = ratings.filter((rating) => rating.isAspect());
    return shortNameTopic
      ? aspects.filter((rating) => rating.isAspectOfTopic(shortNameTopic))
      : aspects;
  }
  return deepFreeze({
    getRating,
    getAspects,
  });
}
