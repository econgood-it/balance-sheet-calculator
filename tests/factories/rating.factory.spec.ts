import { RatingFactory } from "../../src/factories/rating.factory";
import { BalanceSheetType, BalanceSheetVersion } from "../../src/entities/enums";

describe('Rating factory', () => {
    it('should create a default rating for a compact balance sheet', async (done) => {
        const rating = await RatingFactory.createDefaultRating(BalanceSheetType.Compact, BalanceSheetVersion.v5_0_4);
        expect(rating.topics[0]).toMatchObject({
            "aspects": [
                {
                    "estimations": 0, "isWeightSelectedByUser": false,
                    "isPositive": true,
                    "name": "v5:compact.A11",
                    "shortName": "A1.1", "weight": 1
                },
                {
                    "estimations": 0, "isWeightSelectedByUser": false,
                    "isPositive": false,
                    "name": "v5:compact.A12",
                    "shortName": "A1.2", "weight": 1
                }
            ],
            "estimations": 0, "isWeightSelectedByUser": false, "name": "v5:compact.A1", "shortName": "A1", "weight": 1
        })
        done();
    })

    it('should create a default rating for a full balance sheet', async (done) => {
        const rating = await RatingFactory.createDefaultRating(BalanceSheetType.Full, BalanceSheetVersion.v5_0_4);
        expect(rating.topics[0]).toMatchObject({
            "aspects": [
                {
                    "estimations": 0, "isPositive": true, "isWeightSelectedByUser": false,
                    "name": "v5:full.A11",
                    "shortName": "A1.1", "weight": 1
                },
                {
                    "estimations": 0, "isPositive": false, "isWeightSelectedByUser": false,
                    "name": "v5:full.A12",
                    "shortName": "A1.2", "weight": 1
                }
            ],
            "estimations": 0, "isWeightSelectedByUser": false, "name": "v5:full.A1", "shortName": "A1", "weight": 1
        })
        done();
    })
})