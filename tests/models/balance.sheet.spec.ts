import { makeCompanyFacts } from '../../src/models/company.facts';
import { makeBalanceSheet } from '../../src/models/balance.sheet';
import { makeRatingFactory } from '../../src/factories/rating.factory';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { makeRating } from '../../src/models/rating';
import { makeOrganization } from '../../src/models/organization';
import { isTopic } from '../../src/models/oldRating';
import { calculateTotalPoints } from '../../src/calculations/calculator';
import { LookupError } from '../../src/exceptions/lookup.error';

describe('BalanceSheet', () => {
  it('is created with default values', () => {
    const balanceSheet = makeBalanceSheet();
    expect(balanceSheet).toMatchObject({
      version: BalanceSheetVersion.v5_0_8,
      type: BalanceSheetType.Full,
      companyFacts: makeCompanyFacts(),
      ratings: makeRatingFactory().createDefaultRatings(
        BalanceSheetType.Full,
        BalanceSheetVersion.v5_0_8
      ),
      stakeholderWeights: [],
    });
  });
  it('returns topics', () => {
    const balanceSheet = makeBalanceSheet();
    expect(balanceSheet.getTopics().length).toBe(20);
    balanceSheet.getTopics().forEach((topic) => {
      expect(topic.isTopic()).toBeTruthy();
    });
  });

  it('returns aspects of topic', () => {
    const balanceSheet = makeBalanceSheet();
    const topics = balanceSheet.getTopics();
    const firstTopic = topics[0];
    const aspects = balanceSheet.getAspectsOfTopic(firstTopic.shortName);
    expect(aspects).toEqual([
      makeRating({
        shortName: 'A1.1',
        name: 'Working conditions and social impact in the supply chain',
        estimations: 0,
        points: 0,
        maxPoints: 50,
        weight: 1,
        isWeightSelectedByUser: false,
        isPositive: true,
      }),
      makeRating({
        shortName: 'A1.2',
        name: 'Negative aspect: violation of human dignity in the supply chain',
        estimations: 0,
        points: 0,
        maxPoints: -200,
        weight: 1,
        isWeightSelectedByUser: false,
        isPositive: false,
      }),
    ]);
  });

  it('should return rating with shortName', () => {
    const balanceSheet = makeBalanceSheet();
    const rating = balanceSheet.getRating('B1.1');
    expect(rating.shortName).toEqual('B1.1');
  });

  it('should fail with lookup error if rating with shortName does not exist', () => {
    const balanceSheet = makeBalanceSheet();
    expect(() => balanceSheet.getRating('B4.3')).toThrow(LookupError);
  });

  it('submits estimations for ratings', () => {
    const balanceSheet = makeBalanceSheet();
    const newBalanceSheet = balanceSheet.submitEstimations([
      { shortName: 'B1.1', estimations: 5 },
      {
        shortName: 'B1.2',
        estimations: 7,
      },
    ]);
    expect(newBalanceSheet.getRating('B1.1').estimations).toBe(5);
    expect(newBalanceSheet.getRating('B1.2').estimations).toBe(7);
  });

  it('assigns an organization', () => {
    const organization = makeOrganization().withFields({ id: 1 });
    const balanceSheet = makeBalanceSheet();
    const newBalanceSheet = balanceSheet.assignOrganization(organization);
    expect(newBalanceSheet.organizationId).toBe(1);
  });

  describe('calculateTotalPoints', () => {
    // it('should return 1000 if all topics are 50', async () => {
    //   const balanceSheet = makeBalanceSheet();
    //   balanceSheet.ratings.forEach((rating) => {
    //     balanceSheet.submitEstimations(rating.shortName, 10);
    //   });
    //   const totalPoints = calculateTotalPoints(ratings);
    //   expect(totalPoints).toBe(1000);
    // });
    //   it('should return 0 if all topics are 0', async () => {
    //     const ratings = makeRatingFactory().createDefaultRatings(
    //       BalanceSheetType.Full,
    //       BalanceSheetVersion.v5_0_8
    //     );
    //     const totalPoints = calculateTotalPoints(ratings);
    //     expect(totalPoints).toBe(0);
    //   });
    //
    //   function getRatingsWhereAllTopicsWithNegativeAspectHaveSameValue(
    //     points: number
    //   ) {
    //     const balanceSheet = makeBalanceSheet();
    //
    //     const topics = balanceSheet.getTopics();
    //     const topicsWithNegativeAspects = topics.filter((s) =>
    //       balanceSheet.getAspectsOfTopic(s.shortName).some((a) => !a.isPositive)
    //     );
    //     const topicsWith200NegativePoints = topicsWithNegativeAspects.map((t) => ({
    //       ...t,
    //       points,
    //     }));
    //     return defaultRatings.map((r) => {
    //       const topicFound = topicsWith200NegativePoints.find(
    //         (t) => t.shortName === r.shortName
    //       );
    //       return topicFound || r;
    //     });
    //   }
    // it('should return -3600 if all topics with negative aspects are -200', async () => {
    //   const ratings =
    //     getRatingsWhereAllTopicsWithNegativeAspectHaveSameValue(-200);
    //   const totalPoints = calculateTotalPoints(ratings);
    //   expect(totalPoints).toBe(-3600);
    // });
    //
    // it('should return -3600 if due to different stakeholder weights the sum of all topics is less than -3600', async () => {
    //   const ratings =
    //     getRatingsWhereAllTopicsWithNegativeAspectHaveSameValue(-201);
    //   const totalPoints = calculateTotalPoints(ratings);
    //   expect(totalPoints).toBe(-3600);
    // });
  });
});
