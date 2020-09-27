import { TopicDTOCreate } from "../dto/create/topicCreate.dto";
import { RatingDTOCreate } from "../dto/create/ratingCreate.dto";
import { AspectDTOCreate } from "../dto/create/aspectCreate.dto";
import { BalanceSheetType, BalanceSheetVersion } from "../entities/enums";
import * as path from 'path';
import { RatingReader } from "../reader/RatingReader";

export class RatingFactory {
    private static readonly DEFAULT_WEIGHT = undefined;
    private static readonly DEFAULT_ESTIMATION = 0;

    public static async createDefaultRating(balanceSheetType: BalanceSheetType, balanceSheetVersion: BalanceSheetVersion) {
        const ratingReader = new RatingReader();
        const fileName = [balanceSheetType.toLowerCase(), balanceSheetVersion.toLowerCase(),
            "rating.csv"].join('_');
        const pathToCsv = path.join(__dirname, fileName);
        return await ratingReader.readRatingDTOFromCsv(pathToCsv);
    }

}