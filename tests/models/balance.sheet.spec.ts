import { RatingsFactory } from '../../src/factories/ratings.factory';

import {
  BalanceSheetType,
  BalanceSheetVersion,
} from 'e-calculator-schemas/dist/shared.schemas';
import {
  BalanceSheet,
  balanceSheetToMatrixResponse,
  balanceSheetToResponse,
  parseAsBalanceSheet,
  ratingToMatrixRating,
} from '../../src/models/balance.sheet';
import { Rating } from '../../src/models/rating';
import { balanceSheetFactory } from '../../src/openapi/examples';

describe('Parse', () => {
  it('json with a merged rating entity', () => {
    const json = {
      type: BalanceSheetType.Full,
      version: BalanceSheetVersion.v5_0_4,
      ratings: [
        { shortName: 'A1.1', estimations: 5, weight: 1 },
        { shortName: 'D1', weight: 1.5 },
        { shortName: 'D1.2', estimations: 3, weight: 0.5 },
        { shortName: 'E2.1', estimations: 3 },
      ],
    };
    const result = parseAsBalanceSheet(json);

    const defaultRatings = RatingsFactory.createDefaultRatings(
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

  it('json with default rating entity', async () => {
    const json = {
      type: BalanceSheetType.Full,
      version: BalanceSheetVersion.v5_0_4,
    };
    const result = parseAsBalanceSheet(json);

    const expectedRatings = RatingsFactory.createDefaultRatings(
      json.type,
      json.version
    );
    expect(result.ratings).toMatchObject(expectedRatings);
  });
});

describe('balanceSheetToResponse', () => {
  it('parse balanceSheet where country code of main origin of suppliers is not provided', () => {
    const balanceSheet = {
      ...balanceSheetFactory.emptyV508(),
      companyFacts: {
        ...balanceSheetFactory.emptyV508().companyFacts,
        mainOriginOfOtherSuppliers: { costs: 9 },
      },
    };
    const balanceSheetResponse = balanceSheetToResponse(
      undefined,
      balanceSheet,
      'en'
    );
    expect(
      balanceSheetResponse.companyFacts.mainOriginOfOtherSuppliers.countryCode
    ).toBeUndefined();
  });

  it('parse balanceSheet where hasCanteen is undefined', () => {
    const balanceSheet = {
      ...balanceSheetFactory.emptyV508(),
      companyFacts: {
        ...balanceSheetFactory.emptyV508().companyFacts,
        hasCanteen: undefined,
      },
    };
    const balanceSheetResponse = balanceSheetToResponse(
      undefined,
      balanceSheet,
      'en'
    );
    expect(balanceSheetResponse.companyFacts.hasCanteen).toBeUndefined();
  });

  it('parse balanceSheet where country code of some suppliers is missing', () => {
    const balanceSheet = {
      ...balanceSheetFactory.emptyV508(),
      companyFacts: {
        ...balanceSheetFactory.emptyV508().companyFacts,
        supplyFractions: [
          { countryCode: 'ARE', industryCode: 'A', costs: 9 },
          { industryCode: 'Be', costs: 7 },
        ],
        mainOriginOfOtherSuppliers: { costs: 9, countryCode: 'DEU' },
      },
    };
    const balanceSheetResponse = balanceSheetToResponse(
      undefined,
      balanceSheet,
      'en'
    );
    expect(
      balanceSheetResponse.companyFacts.supplyFractions.some(
        (s) => s.countryCode === undefined
      )
    ).toBeTruthy();
  });

  it('parse balanceSheet where country code of some employees is missing', () => {
    const balanceSheet = {
      ...balanceSheetFactory.emptyV508(),
      companyFacts: {
        ...balanceSheetFactory.emptyV508().companyFacts,
        employeesFractions: [
          { countryCode: 'ARE', percentage: 0.3 },
          { percentage: 0.5 },
        ],
        mainOriginOfOtherSuppliers: { costs: 9, countryCode: 'DEU' },
      },
    };
    const balanceSheetResponse = balanceSheetToResponse(
      undefined,
      balanceSheet,
      'en'
    );
    expect(
      balanceSheetResponse.companyFacts.employeesFractions.some(
        (s) => s.countryCode === undefined
      )
    ).toBeTruthy();
  });
});

describe('Matrix DTO', () => {
  let balanceSheet: BalanceSheet;

  beforeEach(() => {
    balanceSheet = balanceSheetFactory.emptyV508();
  });

  it('is created from rating', async () => {
    const matrixDTO = balanceSheetToMatrixResponse(balanceSheet);
    expect(matrixDTO).toBeDefined();
  });

  it('has a topics array of 20', async () => {
    const matrixDTO = balanceSheetToMatrixResponse(balanceSheet);
    expect(matrixDTO.ratings).toHaveLength(20);
  });

  it('has topic A1 with 30 of 50 reached points', async () => {
    balanceSheet.ratings[0].points = 30;
    balanceSheet.ratings[0].maxPoints = 50;
    const matrixDTO = balanceSheetToMatrixResponse(balanceSheet);
    expect(matrixDTO.ratings[0].points).toBe(30);
    expect(matrixDTO.ratings[0].maxPoints).toBe(50);
  });

  it('has topic E4 with 20 of 60 reached points', async () => {
    balanceSheet.ratings[0].points = 20;
    balanceSheet.ratings[0].maxPoints = 60;
    const matrixDTO = balanceSheetToMatrixResponse(balanceSheet);
    expect(matrixDTO.ratings[0].points).toBe(20);
    expect(matrixDTO.ratings[0].maxPoints).toBe(60);
  });
});

describe('Matrix Rating DTO', () => {
  let topicWithZeroValues: Rating;

  beforeEach(() => {
    topicWithZeroValues = {
      shortName: 'A1',
      name: 'Human dignity in the supply chain',
      estimations: 0,
      points: 0,
      maxPoints: 0,
      weight: 0,
      isWeightSelectedByUser: false,
      isPositive: true,
    };
  });

  it('is created from topic', () => {
    const matrixTopicDTO = ratingToMatrixRating(topicWithZeroValues);
    expect(matrixTopicDTO).toBeDefined();
  });

  it('has reached points are 30 of 50', () => {
    const topic = { ...topicWithZeroValues, points: 30, maxPoints: 50 };
    const matrixTopicDTO = ratingToMatrixRating(topic);
    expect(matrixTopicDTO.points).toBe(30);
    expect(matrixTopicDTO.maxPoints).toBe(50);
  });

  it('has reached points are 31 of 50 (round 30.5982934 of 50.08990)', () => {
    const topic = {
      ...topicWithZeroValues,
      points: 30.5982934,
      maxPoints: 50.0899,
    };
    const matrixTopicDTO = ratingToMatrixRating(topic);
    expect(matrixTopicDTO.points).toBe(31);
    expect(matrixTopicDTO.maxPoints).toBe(50);
  });

  it('has reached points are -100 of 60', () => {
    const topic = { ...topicWithZeroValues, points: -100, maxPoints: 60 };
    const matrixTopicDTO = ratingToMatrixRating(topic);
    expect(matrixTopicDTO.points).toBe(-100);
    expect(matrixTopicDTO.maxPoints).toBe(60);
  });

  it('has reached 100%', () => {
    const topic = { ...topicWithZeroValues, points: 50, maxPoints: 50 };

    const matrixTopicDTO = ratingToMatrixRating(topic);
    expect(matrixTopicDTO.percentageReached).toBe(100);
  });

  it('has reached 0%', () => {
    const topic = { ...topicWithZeroValues, maxPoints: 50 };

    const matrixTopicDTO = ratingToMatrixRating(topic);
    expect(matrixTopicDTO.percentageReached).toBe(0);
  });

  it('has undefined percentage when division by 0', () => {
    const topic = { ...topicWithZeroValues, points: 10 };
    const matrixTopicDTO = ratingToMatrixRating(topic);
    expect(matrixTopicDTO.percentageReached).toBeUndefined();
  });

  it('has reached 20% (rounded to the next ten step)', () => {
    const topic = { ...topicWithZeroValues, points: 10, maxPoints: 60 };

    const matrixTopicDTO = ratingToMatrixRating(topic);
    expect(matrixTopicDTO.percentageReached).toBe(20);
  });

  it('has unvalid percentage', () => {
    const topic = { ...topicWithZeroValues, points: -10, maxPoints: 60 };
    const matrixTopicDTO = ratingToMatrixRating(topic);
    expect(matrixTopicDTO.percentageReached).toBeUndefined();
  });

  it('has shortName A1', () => {
    const matrixTopicDTO = ratingToMatrixRating(topicWithZeroValues);
    expect(matrixTopicDTO.shortName).toBe('A1');
  });

  it('has name A1 name', () => {
    const matrixTopicDTO = ratingToMatrixRating(topicWithZeroValues);
    expect(matrixTopicDTO.name).toBe('Human dignity in the supply chain');
  });

  it('is not applicable', () => {
    const matrixTopicDTO = ratingToMatrixRating(topicWithZeroValues);
    expect(matrixTopicDTO.notApplicable).toBeTruthy();
  });

  it('is applicable', () => {
    const topic = { ...topicWithZeroValues, weight: 0.5 };

    const matrixTopicDTO = ratingToMatrixRating(topic);
    expect(matrixTopicDTO.notApplicable).toBeFalsy();
  });
});
