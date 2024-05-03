import deepFreeze from 'deep-freeze';
import { ValueError } from '../exceptions/value.error';
import { z } from 'zod';
import { RatingRequestBodySchema } from '@ecogood/e-calculator-schemas/dist/rating.dto';
import * as _ from 'lodash';
import { mergeVal } from '../merge/merge.utils';

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
  merge: (requestBody: z.infer<typeof RatingRequestBodySchema>) => Rating;
  isTopic: () => boolean;
  isAspect: () => boolean;
  isAspectOfTopic: (shortNameTopic: string) => boolean;
  submitEstimations: (estimations: number) => Rating;
  getStakeholderName: () => string;
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

  function adjustWeight(weight?: number): Rating {
    if (data.isPositive && weight) {
      return makeRating({ ...data, weight, isWeightSelectedByUser: true });
    } else {
      return makeRating({ ...data, isWeightSelectedByUser: false });
    }
  }

  function merge(requestBody: z.infer<typeof RatingRequestBodySchema>): Rating {
    return adjustWeight(requestBody.weight).submitEstimations(
      requestBody.estimations || data.estimations
    );
  }

  return deepFreeze({
    ...data,
    isTopic,
    isAspect,
    isAspectOfTopic,
    submitEstimations,
    getStakeholderName,
    merge,
  });
}
