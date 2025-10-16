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
import { ValueError } from '../../src/exceptions/value.error';
import { lt } from '@mr42/version-comparator/dist/version.comparator';
import {
  makeCompany,
  makeContactPerson,
  makeGeneralInformation,
} from '../../src/models/general.information';
import {
  generalInformationDummy,
  generalInformationDummyJson,
} from './general.information.dummy';

describe('BalanceSheet', () => {
  it('is created with default values', () => {
    const balanceSheet = makeBalanceSheet();
    expect(balanceSheet).toMatchObject({
      version: BalanceSheetVersion.v5_0_8,
      type: BalanceSheetType.Full,
      generalInformation: makeGeneralInformation({
        contactPerson: makeContactPerson({
          email: 'john.doe@example.com',
          name: '',
        }),
        company: makeCompany({
          name: '',
        }),
      }),
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
        type: 'aspect',
        estimations: 0,
        points: 0,
        maxPoints: 50,
        weight: 1,
        isWeightSelectedByUser: false,
        isPositive: true,
      }),
      makeRating({
        shortName: 'A1.2',
        type: 'aspect',
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

  it('should return all positive aspects of compact', () => {
    const balanceSheet = makeBalanceSheet.fromJson({
      version: BalanceSheetVersion.v5_0_8,
      type: BalanceSheetType.Compact,
      generalInformation: generalInformationDummyJson,
    });
    const aspects = balanceSheet.getPositiveAspects();
    expect(aspects.length).toBe(20);
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
        type: 'topic',
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

  it.each([
    { b11: 0, b12: 0, shouldFail: false },
    { b11: 0, b12: 1, shouldFail: false },
    { b11: 1, b12: 0, shouldFail: false },
    { b11: 1, b12: 1, shouldFail: true },
  ])(
    'should validation for version 5.10 if at least one of B1.1 and B1.2 have a weight of 0',
    async ({ b11, b12, shouldFail }) => {
      const balanceSheet = makeBalanceSheet.fromJson({
        version: BalanceSheetVersion.v5_1_0,
        type: BalanceSheetType.Full,
        generalInformation: generalInformationDummyJson,
      });
      const estimations = [
        { shortName: 'B1.1', estimations: 10, weight: b11 },
        { shortName: 'B1.2', estimations: 10, weight: b12 },
      ];
      if (shouldFail) {
        expect(() => balanceSheet.merge({ ratings: estimations })).toThrow(
          ValueError
        );
      } else {
        expect(() =>
          balanceSheet.merge({ ratings: estimations })
        ).not.toThrow();
        const calculatedBalanceSheet = await balanceSheet
          .merge({ ratings: estimations })
          .reCalculate();
        expect(calculatedBalanceSheet.getRating('B1.1').weight).toBe(b11);
        expect(calculatedBalanceSheet.getRating('B1.2').weight).toBe(b12);
      }
    }
  );

  it.each(
    Object.values(BalanceSheetVersion).filter((v) =>
      lt(v, BalanceSheetVersion.v5_1_0)
    )
  )(
    'should fail for version < 5.10 if B1.1 and B1.2 have a weight greater 0',
    (version) => {
      const balanceSheet = makeBalanceSheet.fromJson({
        generalInformation: generalInformationDummyJson,
        version,
        type: BalanceSheetType.Full,
      });
      const estimations = [
        { shortName: 'B1.1', estimations: 10, weight: 1 },
        { shortName: 'B1.2', estimations: 10, weight: 1 },
      ];
      expect(() => balanceSheet.merge({ ratings: estimations })).not.toThrow(
        ValueError
      );
    }
  );

  it('should reset weights correctly', async () => {
    const balancesheet = makeBalanceSheet
      .fromJson({
        generalInformation: generalInformationDummyJson,
        version: BalanceSheetVersion.v5_1_0,
        type: BalanceSheetType.Full,
      })
      .merge({
        ratings: [
          { shortName: 'B1.1', weight: 0 },
          { shortName: 'B1.2', weight: 2 },
        ],
      });
    expect(balancesheet.getRating('B1.1').weight).toEqual(0);
    expect(balancesheet.getRating('B1.2').weight).toEqual(2);
    const balanceSheetWithResetedWeights = balancesheet.merge({
      ratings: [{ shortName: 'B1.1' }, { shortName: 'B1.2' }],
    });
    expect(balanceSheetWithResetedWeights.getRating('B1.1').weight).toEqual(1);
    expect(balanceSheetWithResetedWeights.getRating('B1.2').weight).toEqual(0);
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

    it('where B1.1 has weight 0 and has not been selected by user', () => {
      const balanceSheet = makeBalanceSheet.fromJson({
        generalInformation: generalInformationDummyJson,
        version: BalanceSheetVersion.v5_1_0,
        type: BalanceSheetType.Full,
      });
      const newBalanceSheet = balanceSheet.merge({
        ratings: [
          {
            shortName: 'B1.1',
            estimations: 0,
          },
          { shortName: 'B1.2', estimations: 0 },
        ],
      });

      expect(newBalanceSheet.getRating('B1.1')).toEqual({
        ...balanceSheet.getRating('B1.1'),
        weight: 1,
        isWeightSelectedByUser: false,
      });
      expect(newBalanceSheet.getRating('B1.2')).toEqual({
        ...balanceSheet.getRating('B1.2'),
        weight: 0,
        isWeightSelectedByUser: false,
      });
    });

    it('where B1.1 has weight 0 and has been selected by user', () => {
      const balanceSheet = makeBalanceSheet.fromJson({
        generalInformation: generalInformationDummyJson,
        version: BalanceSheetVersion.v5_1_0,
        type: BalanceSheetType.Full,
      });
      const newBalanceSheet = balanceSheet.merge({
        ratings: [
          {
            shortName: 'B1.1',
            estimations: 0,
            weight: 0,
          },
          { shortName: 'B1.2', estimations: 0 },
        ],
      });

      expect(newBalanceSheet.getRating('B1.1')).toEqual({
        ...balanceSheet.getRating('B1.1'),
        weight: 0,
        isWeightSelectedByUser: true,
      });
      expect(newBalanceSheet.getRating('B1.2')).toEqual({
        ...balanceSheet.getRating('B1.2'),
        weight: 1,
        isWeightSelectedByUser: false,
      });
    });

    it('where B1.1 has weight 0 and weights of B1.1 and B1.2 have been selected by user', () => {
      const balanceSheet = makeBalanceSheet.fromJson({
        generalInformation: generalInformationDummyJson,
        version: BalanceSheetVersion.v5_1_0,
        type: BalanceSheetType.Full,
      });
      const newBalanceSheet = balanceSheet.merge({
        ratings: [
          {
            shortName: 'B1.1',
            estimations: 0,
            weight: 0,
          },
          { shortName: 'B1.2', estimations: 0, weight: 2 },
        ],
      });

      expect(newBalanceSheet.getRating('B1.1')).toEqual({
        ...balanceSheet.getRating('B1.1'),
        weight: 0,
        isWeightSelectedByUser: true,
      });
      expect(newBalanceSheet.getRating('B1.2')).toEqual({
        ...balanceSheet.getRating('B1.2'),
        weight: 2,
        isWeightSelectedByUser: true,
      });
    });

    it('where B1.1 has weight 0 and has been selected by user for version < 5.10', () => {
      const balanceSheet = makeBalanceSheet.fromJson({
        generalInformation: generalInformationDummyJson,
        version: BalanceSheetVersion.v5_0_9,
        type: BalanceSheetType.Full,
      });
      const newBalanceSheet = balanceSheet.merge({
        ratings: [
          {
            shortName: 'B1.1',
            estimations: 0,
            weight: 0,
          },
          { shortName: 'B1.2', estimations: 0 },
        ],
      });

      expect(newBalanceSheet.getRating('B1.1')).toEqual({
        ...balanceSheet.getRating('B1.1'),
        weight: 0,
        isWeightSelectedByUser: true,
      });
      expect(newBalanceSheet.getRating('B1.2')).toEqual({
        ...balanceSheet.getRating('B1.2'),
        weight: 1,
        isWeightSelectedByUser: false,
      });
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
      const balanceSheet = makeBalanceSheet({
        id: 1,
        type: BalanceSheetType.Full,
        version: BalanceSheetVersion.v5_0_8,
        companyFacts: makeCompanyFacts(),
        ratings: makeRatingFactory().createDefaultRatings(
          BalanceSheetType.Full,
          BalanceSheetVersion.v5_0_8
        ),
        stakeholderWeights: [],
        organizationId: undefined,
        generalInformation: generalInformationDummy,
      });

      const json = balanceSheet.toJson('en');
      expect(json).toMatchObject({
        version: BalanceSheetVersion.v5_0_8,
        type: 'Full',
        companyFacts: balanceSheet.companyFacts.toJson(),
        stakeholderWeights: [],
        generalInformation: generalInformationDummyJson,
      });
      expect(json.ratings.length).toBe(80);
    });
  });

  describe('creates balance sheet from create request', () => {
    it('using default ratings', async () => {
      const json = {
        type: BalanceSheetType.Full,
        version: BalanceSheetVersion.v5_0_8,
        generalInformation: generalInformationDummyJson,
      };

      const result = makeBalanceSheet.fromJson(json);

      const expectedRatings = makeRatingFactory().createDefaultRatings(
        json.type,
        json.version
      );
      expect(result.ratings).toMatchObject(expectedRatings);
    });

    it('using given type and version', () => {
      const json = {
        type: BalanceSheetType.Compact,
        version: BalanceSheetVersion.v5_0_6,
        generalInformation: generalInformationDummyJson,
      };

      const result = makeBalanceSheet.fromJson(json);

      expect(result.type).toBe(json.type);
      expect(result.version).toBe(json.version);
    });

    it('using given stakeholder weights', () => {
      const json = {
        type: BalanceSheetType.Compact,
        version: BalanceSheetVersion.v5_0_6,
        stakeholderWeights: [
          { shortName: 'A', weight: 0.5 },
          { shortName: 'B', weight: 1 },
        ],
        generalInformation: generalInformationDummyJson,
      };

      const result = makeBalanceSheet.fromJson(json);
      expect(result.stakeholderWeights).toEqual([
        makeWeighting({ shortName: 'A', weight: 0.5 }),
        makeWeighting({ shortName: 'B', weight: 1 }),
      ]);
    });

    it('json with a merged rating to a balance sheet entity', () => {
      const json = {
        type: BalanceSheetType.Full,
        version: BalanceSheetVersion.v5_0_8,
        ratings: [
          { shortName: 'A1.1', estimations: 5, weight: 1 },
          { shortName: 'D1', weight: 1.5 },
          { shortName: 'D1.2', estimations: 3, weight: 0.5 },
          { shortName: 'E2.1', estimations: 3 },
        ],
        generalInformation: generalInformationDummyJson,
      };
      const result = makeBalanceSheet.fromJson(json);

      const defaultRatings = makeRatingFactory().createDefaultRatings(
        json.type,
        json.version
      );
      const expectedRatings = defaultRatings.map((r) => {
        if (r.shortName === 'A1.1') {
          return {
            shortName: 'A1.1',
            estimations: 5,
            weight: 1,
            isWeightSelectedByUser: true,
          };
        } else if (r.shortName === 'D1.2') {
          return {
            shortName: 'D1.2',
            estimations: 3,
            weight: 0.5,
            isWeightSelectedByUser: true,
          };
        } else if (r.shortName === 'E2.1') {
          return {
            ...r,
            shortName: 'E2.1',
            estimations: 3,
            isWeightSelectedByUser: false,
          };
        } else if (r.shortName === 'D1') {
          return {
            ...r,
            shortName: 'D1',
            weight: 1.5,
            isWeightSelectedByUser: true,
          };
        } else {
          return r;
        }
      });

      expect(result.ratings).toMatchObject(expectedRatings);
    });
  });

  describe('MatrixRepresentation', () => {
    const defaultBalanceSheet = makeBalanceSheet();

    it('has totalPoints of 1000', async () => {
      const defaultRatings = makeRatingFactory().createDefaultRatings(
        BalanceSheetType.Full,
        BalanceSheetVersion.v5_0_8
      );

      const ratings = defaultRatings.map((r) =>
        r.isTopic() ? { ...r, points: 50 } : r
      );
      const balanceSheet = await makeBalanceSheet({
        ...defaultBalanceSheet,
        ratings,
      }).reCalculate();
      const matrixResponse = balanceSheet.asMatrixRepresentation('en');

      expect(matrixResponse.totalPoints).toEqual(balanceSheet.totalPoints());
    });

    it('has a topics array of 20', async () => {
      const matrixResponse = defaultBalanceSheet.asMatrixRepresentation('en');
      expect(matrixResponse.ratings).toHaveLength(20);
    });
    //
    it('has topic A1 with 30 of 50 reached points', async () => {
      const balanceSheet = makeBalanceSheet({
        ...defaultBalanceSheet,
        ratings: [
          makeRating({
            shortName: 'A1',
            type: 'topic',
            estimations: 7,
            points: 30,
            maxPoints: 50,
            weight: 1,
            isWeightSelectedByUser: false,
            isPositive: true,
          }),
          ...defaultBalanceSheet.ratings.slice(1),
        ],
      });

      const matrixDTO = balanceSheet.asMatrixRepresentation('en');
      expect(matrixDTO.ratings[0].points).toBe(30);
      expect(matrixDTO.ratings[0].maxPoints).toBe(50);
    });
    //
    it('has topic E4 with 20 of 60 reached points', async () => {
      const balanceSheet = makeBalanceSheet({
        ...defaultBalanceSheet,
        ratings: [
          makeRating({
            shortName: 'A1',
            type: 'topic',
            estimations: 7,
            points: 20,
            maxPoints: 60,
            weight: 1,
            isWeightSelectedByUser: false,
            isPositive: true,
          }),
          ...defaultBalanceSheet.ratings.slice(1),
        ],
      });

      const matrixDTO = balanceSheet.asMatrixRepresentation('en');
      expect(matrixDTO.ratings[0].points).toBe(20);
      expect(matrixDTO.ratings[0].maxPoints).toBe(60);
    });
  });
});
