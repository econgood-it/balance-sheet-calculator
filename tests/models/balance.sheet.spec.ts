import { makeCompanyFacts } from '../../src/models/company.facts';
import { makeBalanceSheet } from '../../src/models/balance.sheet';
import { makeRatingFactory } from '../../src/factories/rating.factory';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { makeRating } from '../../src/models/rating';
import { makeOrganization } from '../../src/models/organization';
import { LookupError } from '../../src/exceptions/lookup.error';

import { ValueError } from '../../src/exceptions/value.error';

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
      { shortName: 'B3.1', estimations: 5 },
      {
        shortName: 'B3.2',
        estimations: 7,
      },
      { shortName: 'B3.3', estimations: -3 },
    ]);
    expect(newBalanceSheet.getRating('B3.1').estimations).toBe(5);
    expect(newBalanceSheet.getRating('B3.2').estimations).toBe(7);
    expect(newBalanceSheet.getRating('B3.3').estimations).toBe(-3);
    expect(newBalanceSheet.getRating('B3').points).toBe(27);
    expect(newBalanceSheet.getRating('B3').estimations).toBe(27 / 50);
  });

  it('should fail if submitEstimations is called for a topic', () => {
    const balanceSheet = makeBalanceSheet();
    expect(() =>
      balanceSheet.submitEstimations([{ shortName: 'B3', estimations: 5 }])
    ).toThrow(ValueError);
  });

  it('assigns an organization', () => {
    const organization = makeOrganization().withFields({ id: 1 });
    const balanceSheet = makeBalanceSheet();
    const newBalanceSheet = balanceSheet.assignOrganization(organization);
    expect(newBalanceSheet.organizationId).toBe(1);
  });

  it('should return all positive aspects', () => {
    const balanceSheet = makeBalanceSheet();
    const aspects = balanceSheet.getPositiveAspects();
    expect(aspects.length).toBe(41);
    aspects.forEach((aspect) => {
      expect(aspect.isPositive).toBeTruthy();
      expect(aspect.isAspect()).toBeTruthy();
    });
  });

  it('should return all negative aspects', () => {
    const balanceSheet = makeBalanceSheet();
    const aspects = balanceSheet.getNegativeAspects();
    expect(aspects.length).toBe(19);
    aspects.forEach((aspect) => {
      expect(aspect.isPositive).toBeFalsy();
      expect(aspect.isAspect()).toBeTruthy();
    });
  });

  it('should return topic of aspect', () => {
    const balanceSheet = makeBalanceSheet();
    expect(balanceSheet.getTopicOfAspect('B1.1')).toEqual(
      makeRating({
        shortName: 'B1',
        name: 'Ethical position in relation to financial resources',
        estimations: 0,
        points: 0,
        maxPoints: 50,
        weight: 1,
        isWeightSelectedByUser: false,
        isPositive: true,
      })
    );
  });

  it('should fail if topic of aspect could not be found', () => {
    const balanceSheet = makeBalanceSheet();
    expect(() => balanceSheet.getTopicOfAspect('B9.1')).toThrow(LookupError);
  });

  describe('calculateTotalPoints', () => {
    it('should return 1000 if all topics are 50', async () => {
      const balanceSheet = makeBalanceSheet();
      const estimations = balanceSheet.getPositiveAspects().map((rating) => ({
        shortName: rating.shortName,
        estimations: 10,
      }));
      const newBalanceSheet = balanceSheet.submitEstimations(estimations);
      expect(newBalanceSheet.totalPoints()).toBeCloseTo(1000, 11);
    });
    it('should return 0 if all topics are 0', async () => {
      const balanceSheet = makeBalanceSheet();
      expect(balanceSheet.totalPoints()).toBe(0);
    });
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
    it('should return -3600 if all topics with negative aspects are -200', async () => {
      const balanceSheet = makeBalanceSheet();
      const estimations = balanceSheet.getNegativeAspects().map((rating) => ({
        shortName: rating.shortName,
        estimations: -200,
      }));
      const newBalanceSheet = balanceSheet.submitEstimations(estimations);
      expect(newBalanceSheet.totalPoints()).toBe(-3600);

      // const ratings =
      //   getRatingsWhereAllTopicsWithNegativeAspectHaveSameValue(-200);
      // const totalPoints = calculateTotalPoints(ratings);
      // expect(totalPoints).toBe(-3600);
    });
    //
    // it('should return -3600 if due to different stakeholder weights the sum of all topics is less than -3600', async () => {
    //   const ratings =
    //     getRatingsWhereAllTopicsWithNegativeAspectHaveSameValue(-201);
    //   const totalPoints = calculateTotalPoints(ratings);
    //   expect(totalPoints).toBe(-3600);
    // });
  });
});
