import deepFreeze from 'deep-freeze';
import { ValueError } from '../exceptions/value.error';

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
  submitEstimations: (estimation: number) => Rating;
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
    if (estimations < 0 && data.isPositive) {
      throw new ValueError(
        'Estimations cannot be negative for positive ratings'
      );
    }
    if (estimations > 0 && !data.isPositive) {
      throw new ValueError(
        'Estimations cannot be positive for negative ratings'
      );
    }
    return makeRating({ ...data, estimations });
  }

  return deepFreeze({
    ...data,
    isTopic,
    isAspect,
    isAspectOfTopic,
    submitEstimations,
  });
}
