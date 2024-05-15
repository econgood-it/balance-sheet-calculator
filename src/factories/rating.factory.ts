import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';

import path from 'path';
import fs from 'fs';
import { makeRating, Rating } from '../models/rating';
import deepFreeze from 'deep-freeze';
import { z } from 'zod';

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
    const fileName = `ratings_${balanceSheetType
      .toString()
      .toLowerCase()}_${balanceSheetVersion.toString().toLowerCase()}.json`;
    const pathToRatings = path.join(
      path.resolve(__dirname, '../files/factories/'),
      fileName
    );
    return fromFile(pathToRatings);
  }

  function fromFile(path: string): Rating[] {
    const fileText = fs.readFileSync(path);
    const jsonParsed = JSON.parse(fileText.toString());
    const ratings = RatingSchema.array().parse(jsonParsed);
    return ratings.map((rating) => makeRating({ ...rating }));
  }

  return deepFreeze({
    createDefaultRatings,
  });
}
