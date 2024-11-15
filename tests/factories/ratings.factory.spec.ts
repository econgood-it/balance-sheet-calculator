import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { makeRatingFactory } from '../../src/factories/rating.factory';
import { makeRatingsQuery } from '../../src/models/rating';

describe('Ratings factory', () => {
  it('should create default ratings for a full balance sheet of version 5.10', () => {
    const ratingsQuery = makeRatingsQuery(
      makeRatingFactory().createDefaultRatings(
        BalanceSheetType.Full,
        BalanceSheetVersion.v5_1_0
      )
    );
    expect(ratingsQuery.getAspects('E2').map((e) => e.shortName)).toEqual([
      'E2.1',
      'E2.2',
      'E2.3',
    ]);
    expect(ratingsQuery.getAspects('B4').map((e) => e.shortName)).toEqual([
      'B4.1',
      'B4.2',
      'B4.3',
    ]);
    expect(ratingsQuery.getAspects('B1').map((e) => e.shortName)).toEqual([
      'B1.1',
      'B1.2',
      'B1.3',
      'B1.4',
    ]);
    expect(ratingsQuery.getRating('B1.1').weight).toEqual(1);
    expect(ratingsQuery.getRating('B1.2').weight).toEqual(0);
  });
  it('should create default ratings for a compact balance sheet of version 5.10', () => {
    const ratings = makeRatingFactory().createDefaultRatings(
      BalanceSheetType.Compact,
      BalanceSheetVersion.v5_1_0
    );
    const ratingsQuery = makeRatingsQuery(ratings);
    expect(ratingsQuery.getAspects('E2').map((e) => e.shortName)).toEqual([
      'E2.1',
      'E2.2',
      'E2.3',
    ]);
    expect(ratingsQuery.getAspects('B4').map((e) => e.shortName)).toEqual([
      'B4.1',
      'B4.2',
      'B4.3',
    ]);
    expect(ratingsQuery.getAspects('B1').map((e) => e.shortName)).toEqual([
      'B1.1',
      'B1.2',
      'B1.3',
      'B1.4',
    ]);
    expect(ratingsQuery.getRating('B1.1').weight).toEqual(1);
    expect(ratingsQuery.getRating('B1.2').weight).toEqual(0);
    expect(ratings).toHaveLength(81);
  });
  it('should create default ratings for a full balance sheet of version 5.09', () => {
    const ratings = makeRatingFactory().createDefaultRatings(
      BalanceSheetType.Full,
      BalanceSheetVersion.v5_0_9
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
  });
  it('should create default ratings for a full balance sheet of version 5.08', () => {
    const ratings = makeRatingFactory().createDefaultRatings(
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

  it('should create a default ratings for a compact balance sheet of version 5.09', () => {
    const ratings = makeRatingFactory().createDefaultRatings(
      BalanceSheetType.Compact,
      BalanceSheetVersion.v5_0_9
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

  it('should create a default ratings for a compact balance sheet of version 5.08', () => {
    const ratings = makeRatingFactory().createDefaultRatings(
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
