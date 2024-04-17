import {
  filterAspectsOfTopic,
  filterTopics,
  isTopic,
} from '../../src/models/oldRating';
import { OldRatingsFactory } from '../../src/factories/oldRatingsFactory';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { calculateTotalPoints } from '../../src/calculations/oldCalculator';

describe('calculateTotalPoints', () => {
  it('should return 1000 if all topics are 50', async () => {
    const defaultRatings = OldRatingsFactory.createDefaultRatings(
      BalanceSheetType.Full,
      BalanceSheetVersion.v5_0_8
    );
    const ratings = defaultRatings.map((r) =>
      isTopic(r) ? { ...r, points: 50 } : r
    );
    const totalPoints = calculateTotalPoints(ratings);
    expect(totalPoints).toBe(1000);
  });
  it('should return 0 if all topics are 0', async () => {
    const ratings = OldRatingsFactory.createDefaultRatings(
      BalanceSheetType.Full,
      BalanceSheetVersion.v5_0_8
    );
    const totalPoints = calculateTotalPoints(ratings);
    expect(totalPoints).toBe(0);
  });

  function getRatingsWhereAllTopicsWithNegativeAspectHaveSameValue(
    points: number
  ) {
    const defaultRatings = OldRatingsFactory.createDefaultRatings(
      BalanceSheetType.Full,
      BalanceSheetVersion.v5_0_8
    );
    const topics = filterTopics(defaultRatings);
    const topicsWithNegativeAspects = topics.filter((s) =>
      filterAspectsOfTopic(defaultRatings, s.shortName).some(
        (a) => !a.isPositive
      )
    );
    const topicsWith200NegativePoints = topicsWithNegativeAspects.map((t) => ({
      ...t,
      points,
    }));
    return defaultRatings.map((r) => {
      const topicFound = topicsWith200NegativePoints.find(
        (t) => t.shortName === r.shortName
      );
      return topicFound || r;
    });
  }

  it('should return -3600 if all topics with negative aspects are -200', async () => {
    const ratings =
      getRatingsWhereAllTopicsWithNegativeAspectHaveSameValue(-200);
    const totalPoints = calculateTotalPoints(ratings);
    expect(totalPoints).toBe(-3600);
  });

  it('should return -3600 if due to different stakeholder weights the sum of all topics is less than -3600', async () => {
    const ratings =
      getRatingsWhereAllTopicsWithNegativeAspectHaveSameValue(-201);
    const totalPoints = calculateTotalPoints(ratings);
    expect(totalPoints).toBe(-3600);
  });
});
