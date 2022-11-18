import * as path from 'path';
import { BalanceSheetType, BalanceSheetVersion } from '../models/balance.sheet';
import { Rating, RatingSchema } from '../models/rating';
import fs from 'fs';

export class RatingsFactory {
  public static createDefaultRatings(
    balanceSheetType: BalanceSheetType,
    balanceSheetVersion: BalanceSheetVersion
  ): Rating[] {
    const pathToRatings = path.join(
      path.resolve(__dirname, '../files/factories/'),
      'ratings_5.08.json'
    );
    return RatingsFactory.fromFile(pathToRatings);
  }

  private static fromFile(path: string): Rating[] {
    const fileText = fs.readFileSync(path);
    const jsonParsed = JSON.parse(fileText.toString());
    return RatingSchema.array().parse(jsonParsed);
  }
}
