import * as path from 'path';

import { OldRating, RatingSchema } from '../models/oldRating';
import fs from 'fs';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';

export class RatingsFactory {
  public static createDefaultRatings(
    balanceSheetType: BalanceSheetType,
    balanceSheetVersion: BalanceSheetVersion
  ): OldRating[] {
    const fileName = `ratings_${balanceSheetType
      .toString()
      .toLowerCase()}_${balanceSheetVersion.toString().toLowerCase()}.json`;
    const pathToRatings = path.join(
      path.resolve(__dirname, '../files/factories/'),
      fileName
    );
    return RatingsFactory.fromFile(pathToRatings);
  }

  private static fromFile(path: string): OldRating[] {
    const fileText = fs.readFileSync(path);
    const jsonParsed = JSON.parse(fileText.toString());
    return RatingSchema.array().parse(jsonParsed);
  }
}
