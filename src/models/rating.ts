import deepFreeze from 'deep-freeze';
import { ValueError } from '../exceptions/value.error';
import { z } from 'zod';

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
  isTopic: () => boolean;
  isAspect: () => boolean;
  isAspectOfTopic: (shortNameTopic: string) => boolean;
  submitPositiveEstimations: (estimations: number) => Rating;
  submitNegativeEstimations: (
    estimations: number,
    topicMaxPoints: number
  ) => Rating;
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

  function submitPositiveEstimations(estimations: number): Rating {
    if (!data.isPositive) {
      throw new ValueError(
        'You cannot submit positive estimations for a negative rating'
      );
    }
    const points = (data.maxPoints * estimations) / 10.0;
    return makeRating({ ...data, estimations, points });
  }

  function submitNegativeEstimations(
    estimations: number,
    topicMaxPoints: number
  ): Rating {
    if (data.isPositive) {
      throw new ValueError(
        'You cannot submit negative estimations for a positive rating'
      );
    }
    const points = (estimations * topicMaxPoints) / 50.0;
    return makeRating({ ...data, estimations, points });
  }

  function getStakeholderName(): string {
    return data.shortName.substring(0, 1);
  }

  return deepFreeze({
    ...data,
    isTopic,
    isAspect,
    isAspectOfTopic,
    submitPositiveEstimations,
    submitNegativeEstimations,
    getStakeholderName,
  });
}
