import { RatingsFactory } from '../../src/factories/ratings.factory';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';

describe('Ratings factory', () => {
  it('should create a default rating for a full balance sheet', () => {
    const ratings = RatingsFactory.createDefaultRatings(
      BalanceSheetType.Full,
      BalanceSheetVersion.v5_0_8
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

  it('should create a default rating for a compact balance sheet', () => {
    const ratings = RatingsFactory.createDefaultRatings(
      BalanceSheetType.Compact,
      BalanceSheetVersion.v5_0_6
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
      name: 'Human dignity in the supply chain',
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
    expect(ratings[ratings.length - 1]).toMatchObject({
      estimations: 0,
      isPositive: false,
      isWeightSelectedByUser: false,
      name: 'Negative aspect: lack of transparency and wilful misinformation',
      shortName: 'E4.2',
      weight: 1,
    });
  });
});
