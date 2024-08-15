import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { makeRating, Rating } from '../models/rating';
import deepFreeze from 'deep-freeze';
import { z } from 'zod';
import { makeFull5v08 } from './ratings_full_5.08';

import { makeFull5v10 } from './ratings_full_5.10';
import { makeCompact5v08 } from './ratings_compact_5.08';
import { gte, eq } from '@mr42/version-comparator/dist/version.comparator';

const RatingSchema = z.object({
  shortName: z.string(),
  name: z.string(),
  estimations: z.number(),
  points: z.number(),
  maxPoints: z.number(),
  weight: z.number(),
  isWeightSelectedByUser: z.boolean(),
  isPositive: z.boolean(),
});

export function makeRatingFactory() {
  function createDefaultRatings(
    balanceSheetType: BalanceSheetType,
    balanceSheetVersion: BalanceSheetVersion
  ): Rating[] {
    if (balanceSheetType === BalanceSheetType.Full) {
      if (eq(balanceSheetVersion, BalanceSheetVersion.v5_1_0)) {
        return fromObject(makeFull5v10());
      }
      if (gte(balanceSheetVersion, BalanceSheetVersion.v5_0_8)) {
        return fromObject(makeFull5v08());
      }
    }
    return fromObject(makeCompact5v08());
  }

  function fromObject(obj: any): Rating[] {
    return RatingSchema.array()
      .parse(obj)
      .map((rating) => makeRating({ ...rating }));
  }

  return deepFreeze({
    createDefaultRatings,
  });
}
