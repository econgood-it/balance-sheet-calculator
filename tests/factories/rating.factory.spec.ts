import { RatingFactory } from "../../src/factories/rating.factory";
import { BalanceSheetType } from "../../src/entities/enums";

describe('Rating factory', () => {
    it('should create a default rating for a compact balance sheet', () => {
        const rating = RatingFactory.createDefaultRating(BalanceSheetType.Compact);
        expect(rating.topics).toContainEqual({
            "aspects": [], "estimations": 0, "name": "Human dignity in the supply chain", "shortName": "A1", "weight": 1
        })
    })

    it('should create a default rating for a full balance sheet', () => {
        const rating = RatingFactory.createDefaultRating(BalanceSheetType.Full);
        expect(rating.topics).toContainEqual({
            "aspects": [{ "estimations": 0, "name": "Human dignity in the supply chain", "shortName": "A1.1", "weight": 1 }],
            "estimations": 0, "name": "Human dignity in the supply chain", "shortName": "A1", "weight": 1
        })
    })
})