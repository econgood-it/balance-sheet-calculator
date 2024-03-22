import { z } from 'zod';
import deepFreeze from 'deep-freeze';

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
  withFields: (fields: Partial<RatingOpts>) => Rating;
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
  function withFields(fields: Partial<RatingOpts>): Rating {
    return makeRating({ ...data, ...fields });
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

  return deepFreeze({
    ...data,
    withFields,
    isTopic,
    isAspect,
    isAspectOfTopic,
  });
}
