import { BalanceSheetType, BalanceSheetVersion } from '../entities/enums';
import * as path from 'path';
import { RatingsReader } from '../reader/ratings.reader';
import { Rating } from '../entities/rating';

export class RatingsFactory {
  public static async createDefaultRatings(
    balanceSheetType: BalanceSheetType,
    balanceSheetVersion: BalanceSheetVersion
  ): Promise<Rating[]> {
    const ratingsReader = new RatingsReader();
    const fileName = [
      balanceSheetType.toLowerCase(),
      balanceSheetVersion.toLowerCase(),
      'rating.csv',
    ].join('_');
    const pathToCsv = path.join(
      path.resolve(__dirname, '../files/factories'),
      fileName
    );
    return await ratingsReader.readRatingsFromCsv(pathToCsv);
  }
}
