import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { OldRatingsFactory } from '../../src/factories/oldRatingsFactory';
import {
  balanceSheetFactory,
  companyFactsJsonFactory,
} from '../../src/openapi/examples';
import {
  BalanceSheetCreateRequest,
  MatrixFormat,
  MatrixRatingFormat,
} from '../../src/dto/balance.sheet.dto';
import { OldBalanceSheet } from '../../src/models/oldBalanceSheet';
import { isTopic, OldRating } from '../../src/models/oldRating';
import { calculateTotalPoints } from '../../src/calculations/calculator';

describe('Transform', () => {
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
    };
    const result = new BalanceSheetCreateRequest(json).toBalanceEntity();

    const defaultRatings = OldRatingsFactory.createDefaultRatings(
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

  it('json with default rating to balance sheet entity', async () => {
    const json = {
      type: BalanceSheetType.Full,
      version: BalanceSheetVersion.v5_0_8,
    };
    const result = new BalanceSheetCreateRequest(json).toBalanceEntity();

    const expectedRatings = OldRatingsFactory.createDefaultRatings(
      json.type,
      json.version
    );
    expect(result.ratings).toMatchObject(expectedRatings);
  });

  it('json and divide percentage values by 100', async () => {
    const companyFactsAsJson = companyFactsJsonFactory.nonEmptyRequest();
    const json = {
      type: BalanceSheetType.Full,
      version: BalanceSheetVersion.v5_0_8,
      companyFacts: companyFactsAsJson,
    };
    const result = new BalanceSheetCreateRequest(json).toBalanceEntity();
    expect(result.companyFacts.industrySectors).toHaveLength(
      companyFactsAsJson.industrySectors.length
    );
    expect(result.companyFacts.employeesFractions).toHaveLength(
      companyFactsAsJson.employeesFractions.length
    );
    for (const index in result.companyFacts.industrySectors) {
      expect(
        result.companyFacts.industrySectors[index].amountOfTotalTurnover
      ).toBe(
        companyFactsAsJson.industrySectors[index].amountOfTotalTurnover / 100
      );
    }
    for (const index in result.companyFacts.employeesFractions) {
      expect(result.companyFacts.employeesFractions[index].percentage).toBe(
        companyFactsAsJson.employeesFractions[index].percentage / 100
      );
    }
  });
});

describe('MatrixRepresentation', () => {
  let balanceSheet: OldBalanceSheet;

  beforeEach(() => {
    balanceSheet = balanceSheetFactory.emptyFullV508();
  });

  it('is created from rating', async () => {
    const matrixResponse = new MatrixFormat(balanceSheet).apply();
    expect(matrixResponse).toBeDefined();
  });

  it('has totalPoints of 1000', async () => {
    const defaultRatings = OldRatingsFactory.createDefaultRatings(
      BalanceSheetType.Full,
      BalanceSheetVersion.v5_0_8
    );
    const ratings = defaultRatings.map((r) =>
      isTopic(r) ? { ...r, points: 50 } : r
    );
    const matrixResponse = new MatrixFormat({
      ...balanceSheet,
      ratings,
    }).apply();

    expect(matrixResponse.totalPoints).toBe(calculateTotalPoints(ratings));
  });

  it('has a topics array of 20', async () => {
    const matrixResponse = new MatrixFormat(balanceSheet).apply();
    expect(matrixResponse.ratings).toHaveLength(20);
  });

  it('has topic A1 with 30 of 50 reached points', async () => {
    balanceSheet.ratings[0].points = 30;
    balanceSheet.ratings[0].maxPoints = 50;
    const matrixDTO = new MatrixFormat(balanceSheet).apply();
    expect(matrixDTO.ratings[0].points).toBe(30);
    expect(matrixDTO.ratings[0].maxPoints).toBe(50);
  });

  it('has topic E4 with 20 of 60 reached points', async () => {
    balanceSheet.ratings[0].points = 20;
    balanceSheet.ratings[0].maxPoints = 60;
    const matrixDTO = new MatrixFormat(balanceSheet).apply();
    expect(matrixDTO.ratings[0].points).toBe(20);
    expect(matrixDTO.ratings[0].maxPoints).toBe(60);
  });
});

describe('Matrix Rating DTO', () => {
  let topicWithZeroValues: OldRating;

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
    const matrixTopicDTO = new MatrixRatingFormat(topicWithZeroValues).apply();
    expect(matrixTopicDTO).toBeDefined();
  });

  it('has reached points are 30 of 50', () => {
    const topic = { ...topicWithZeroValues, points: 30, maxPoints: 50 };
    const matrixTopicDTO = new MatrixRatingFormat(topic).apply();
    expect(matrixTopicDTO.points).toBe(30);
    expect(matrixTopicDTO.maxPoints).toBe(50);
  });

  it('has reached points are 31 of 50 (round 30.5982934 of 50.08990)', () => {
    const topic = {
      ...topicWithZeroValues,
      points: 30.5982934,
      maxPoints: 50.0899,
    };
    const matrixTopicDTO = new MatrixRatingFormat(topic).apply();
    expect(matrixTopicDTO.points).toBe(31);
    expect(matrixTopicDTO.maxPoints).toBe(50);
  });

  it('has reached points are -100 of 60', () => {
    const topic = { ...topicWithZeroValues, points: -100, maxPoints: 60 };
    const matrixTopicDTO = new MatrixRatingFormat(topic).apply();
    expect(matrixTopicDTO.points).toBe(-100);
    expect(matrixTopicDTO.maxPoints).toBe(60);
  });

  it('has reached 100%', () => {
    const topic = { ...topicWithZeroValues, points: 50, maxPoints: 50 };

    const matrixTopicDTO = new MatrixRatingFormat(topic).apply();
    expect(matrixTopicDTO.percentageReached).toBe(100);
  });

  it('has reached 0%', () => {
    const topic = { ...topicWithZeroValues, maxPoints: 50 };

    const matrixTopicDTO = new MatrixRatingFormat(topic).apply();
    expect(matrixTopicDTO.percentageReached).toBe(0);
  });

  it('has undefined percentage when division by 0', () => {
    const topic = { ...topicWithZeroValues, points: 10 };
    const matrixTopicDTO = new MatrixRatingFormat(topic).apply();
    expect(matrixTopicDTO.percentageReached).toBeUndefined();
  });

  it('has reached 20% (rounded to the next ten step)', () => {
    const topic = { ...topicWithZeroValues, points: 10, maxPoints: 60 };

    const matrixTopicDTO = new MatrixRatingFormat(topic).apply();
    expect(matrixTopicDTO.percentageReached).toBe(20);
  });

  it('has unvalid percentage', () => {
    const topic = { ...topicWithZeroValues, points: -10, maxPoints: 60 };
    const matrixTopicDTO = new MatrixRatingFormat(topic).apply();
    expect(matrixTopicDTO.percentageReached).toBeUndefined();
  });

  it('has shortName A1', () => {
    const matrixTopicDTO = new MatrixRatingFormat(topicWithZeroValues).apply();
    expect(matrixTopicDTO.shortName).toBe('A1');
  });

  it('has name A1 name', () => {
    const matrixTopicDTO = new MatrixRatingFormat(topicWithZeroValues).apply();
    expect(matrixTopicDTO.name).toBe('Human dignity in the supply chain');
  });

  it('is not applicable', () => {
    const matrixTopicDTO = new MatrixRatingFormat(topicWithZeroValues).apply();
    expect(matrixTopicDTO.notApplicable).toBeTruthy();
  });

  it('is applicable', () => {
    const topic = { ...topicWithZeroValues, weight: 0.5 };

    const matrixTopicDTO = new MatrixRatingFormat(topic).apply();
    expect(matrixTopicDTO.notApplicable).toBeFalsy();
  });
});
