import {
  makeCompanyFacts,
  makeSupplyFraction,
} from '../../src/models/company.facts';
import { makeBalanceSheet } from '../../src/models/balance.sheet';
import { makeRatingFactory } from '../../src/factories/rating.factory';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { makeRating } from '../../src/models/rating';
import { makeOrganization } from '../../src/models/organization';
import { LookupError } from '../../src/exceptions/lookup.error';
import { makeWeighting } from '../../src/models/weighting';
import { BalanceSheetEntity } from '../../src/entities/balance.sheet.entity';
import { balanceSheetFactory } from '../../src/openapi/examples';

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
    const aspects = balanceSheet.getAspects(firstTopic.shortName);
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

  it('should return all positive aspects of topic', () => {
    const balanceSheet = makeBalanceSheet();
    const aspects = balanceSheet.getPositiveAspects('A1');
    expect(aspects.length).toBe(1);
    expect(aspects[0].shortName).toEqual('A1.1');
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

  it('should return all negative aspects of a topic', () => {
    const balanceSheet = makeBalanceSheet();
    const aspects = balanceSheet.getNegativeAspects('A1');
    expect(aspects.length).toBe(1);
    expect(aspects[0].shortName).toEqual('A1.2');
  });

  it('should return all aspects', () => {
    const balanceSheet = makeBalanceSheet();
    const aspects = balanceSheet.getAspects();
    expect(aspects.length).toBe(60);
    aspects.forEach((aspect) => {
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
      const newBalanceSheet = await balanceSheet
        .merge({ ratings: estimations })
        .reCalculate();
      expect(newBalanceSheet.totalPoints()).toBeCloseTo(1000, 11);
    });
    it('should return 0 if all topics are 0', async () => {
      const balanceSheet = await makeBalanceSheet().reCalculate();
      expect(balanceSheet.totalPoints()).toBe(0);
    });

    it('should return -3600 if all topics with negative aspects are -200', async () => {
      const balanceSheet = makeBalanceSheet();
      const estimations = balanceSheet.getNegativeAspects().map((rating) => ({
        shortName: rating.shortName,
        estimations: -200,
      }));
      const newBalanceSheet = await balanceSheet
        .merge({ ratings: estimations })
        .reCalculate();
      expect(newBalanceSheet.totalPoints()).toBe(-3600);
    });

    //
    // it('should return -3600 if due to different stakeholder weights the sum of all topics is less than -3600', async () => {
    //   const ratings =
    //     getRatingsWhereAllTopicsWithNegativeAspectHaveSameValue(-201);
    //   const totalPoints = calculateTotalPoints(ratings);
    //   expect(totalPoints).toBe(-3600);
    // });
  });
  describe('is merged', () => {
    it('with request body', () => {
      const balanceSheet = makeBalanceSheet();
      const requestBody = {
        ratings: [
          {
            shortName: 'D4.2',
            estimations: 4,
          },
          {
            shortName: 'D4.3',
            estimations: -100,
          },
        ],
        companyFacts: {
          supplyFractions: [
            { countryCode: 'BEL', costs: 20, industryCode: 'A' },
            { countryCode: 'DEU', costs: 13, industryCode: 'B' },
          ],
        },
      };

      const newBalanceSheet = balanceSheet.merge(requestBody);
      expect(newBalanceSheet.getRating('D4.2').estimations).toBe(4);
      expect(newBalanceSheet.getRating('D4.3').estimations).toBe(-100);
      expect(newBalanceSheet.companyFacts.supplyFractions).toEqual([
        makeSupplyFraction({
          countryCode: 'BEL',
          costs: 20,
          industryCode: 'A',
        }),
        makeSupplyFraction({
          countryCode: 'DEU',
          costs: 13,
          industryCode: 'B',
        }),
      ]);
    });

    it('using empty stakeholder weights from request body', () => {
      const balanceSheet = makeBalanceSheet({
        ...makeBalanceSheet(),
        stakeholderWeights: [
          makeWeighting({
            shortName: 'A',
            weight: 0.5,
          }),
        ],
      });
      const requestBody = {
        ratings: [],
        stakeholderWeights: [],
      };

      const newBalanceSheet = balanceSheet.merge(requestBody);
      expect(newBalanceSheet.stakeholderWeights).toEqual([]);
    });

    it('using stakeholder weights from domain', () => {
      const balanceSheet = makeBalanceSheet({
        ...makeBalanceSheet(),
        stakeholderWeights: [
          makeWeighting({
            shortName: 'A',
            weight: 0.5,
          }),
        ],
      });
      const requestBody = {
        ratings: [],
        stakeholderWeights: undefined,
      };

      const newBalanceSheet = balanceSheet.merge(requestBody);
      expect(newBalanceSheet.stakeholderWeights).toEqual([
        makeWeighting({
          shortName: 'A',
          weight: 0.5,
        }),
      ]);
    });

    it('using non empty stakeholder weights from request body', () => {
      const balanceSheet = makeBalanceSheet({
        ...makeBalanceSheet(),
        stakeholderWeights: [
          makeWeighting({
            shortName: 'A',
            weight: 0.5,
          }),
        ],
      });
      const requestBody = {
        ratings: [],
        stakeholderWeights: [
          { shortName: 'A', weight: 2 },
          { shortName: 'D', weight: 1.5 },
        ],
      };

      const newBalanceSheet = balanceSheet.merge(requestBody);
      expect(newBalanceSheet.stakeholderWeights).toEqual([
        makeWeighting({
          shortName: 'A',
          weight: 2,
        }),
        makeWeighting({
          shortName: 'D',
          weight: 1.5,
        }),
      ]);
    });
  });

  describe('toJson', () => {
    it('should return json', () => {
      const balanceSheet = makeBalanceSheet();
      const json = balanceSheet.toJson('en');
      expect(json).toMatchObject({
        version: BalanceSheetVersion.v5_0_8,
        type: 'Full',
        companyFacts: balanceSheet.companyFacts.toJson(),
        stakeholderWeights: [],
      });
      expect(json.ratings.length).toBe(80);
    });
  });
});
