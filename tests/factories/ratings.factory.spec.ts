import { RatingsFactory } from '../../src/factories/ratings.factory';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '../../src/models/balance.sheet';

describe('Ratings factory', () => {
  it('should create a default rating for a full balance sheet', async () => {
    const ratings = await RatingsFactory.createDefaultRatings(
      BalanceSheetType.Full,
      BalanceSheetVersion.v5_0_4
    );
    expect(ratings[0]).toMatchObject({
      estimations: 0,
      isWeightSelectedByUser: false,
      name: 'Human dignity in the supply chain',
      shortName: 'A1',
      weight: 1,
    });
    expect(ratings[1]).toMatchObject({
      estimations: 0,
      isPositive: true,
      isWeightSelectedByUser: false,
      name: 'Working conditions and social impact in the supply chain',
      shortName: 'A1.1',
      weight: 1,
    });
    expect(ratings[2]).toMatchObject({
      estimations: 0,
      isPositive: false,
      isWeightSelectedByUser: false,
      name: 'Negative aspect: violation of human dignity in the supply chain',
      shortName: 'A1.2',
      weight: 1,
    });
  });
});
