import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { OldRating, RatingSchema } from '../models/oldRating';
import path from 'path';
import fs from 'fs';
import { makeRating, Rating } from '../models/rating';
import deepFreeze from 'deep-freeze';

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
    return ratings.map((rating: OldRating) => makeRating({ ...rating }));
  }

  return deepFreeze({
    createDefaultRatings,
  });
}
