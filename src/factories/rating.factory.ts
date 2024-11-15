import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { makeRating, Rating } from '../models/rating';
import deepFreeze from 'deep-freeze';
import { z } from 'zod';

import { makeFull5v10 } from './ratings_full_5.10';
import { makeCompact5v08 } from './ratings_compact_5.08';
import { lt } from '@mr42/version-comparator/dist/version.comparator';
import { makeWorkbook, Workbook } from '../models/workbook';
import { ValueError } from '../exceptions/value.error';
import { makeFull5v08 } from './ratings_full_5.08';

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
    // TODO: Replace hard coded language here and test number of positive aspects afterwards for german version
    // TODO: Include type from workbook in rating already here instead of inferring it later from the name
    const workbook = makeWorkbook.fromFile(
      balanceSheetVersion,
      balanceSheetType,
      'en'
    );
    if (lt(balanceSheetVersion, BalanceSheetVersion.v5_1_0)) {
      return balanceSheetType === BalanceSheetType.Full
        ? fromObject(makeFull5v08(), workbook)
        : fromObject(makeCompact5v08(), workbook);
    }
    return fromObject(makeFull5v10(), workbook);
  }

  function fromObject(objs: any, workbook: Workbook): Rating[] {
    return RatingSchema.array()
      .parse(
        objs.map((o: any) => {
          const foundWorkbookRating = workbook.findByShortName(o.shortName);
          if (foundWorkbookRating === undefined) {
            throw new ValueError(
              `ShortName ${o.shortName} not found in workbook`
            );
          }
          return {
            ...o,
            name: foundWorkbookRating.name,
            isPositive: foundWorkbookRating.isPositive,
          };
        })
      )
      .map((rating) => makeRating({ ...rating }));
  }

  return deepFreeze({
    createDefaultRatings,
  });
}
