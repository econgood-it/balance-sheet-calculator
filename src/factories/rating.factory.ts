import { BalanceSheetType, BalanceSheetVersion } from "../entities/enums";
import * as path from 'path';
import { RatingReader } from "../reader/RatingReader";
import { Rating } from "../entities/rating";

export class RatingFactory {
    private static readonly DEFAULT_WEIGHT = undefined;
    private static readonly DEFAULT_ESTIMATION = 0;

    public static async createDefaultRating(balanceSheetType: BalanceSheetType,
        balanceSheetVersion: BalanceSheetVersion): Promise<Rating> {
        const ratingReader = new RatingReader();
        const fileName = [balanceSheetType.toLowerCase(), balanceSheetVersion.toLowerCase(),
            "rating.csv"].join('_');
        const pathToCsv = path.join(path.resolve(__dirname, '../files/factories'), fileName);
        return await ratingReader.readRatingFromCsv(pathToCsv);
    }

}