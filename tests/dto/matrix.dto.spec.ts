import { BalanceSheet } from '../../src/models/balance.sheet';
import { balanceSheetFactory } from '../testData/balance.sheet';
import {
  balanceSheetToMatrixResponse,
  ratingToMatrixRating,
} from '../../src/dto/matrix.dto';
import { Rating } from '../../src/models/rating';

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
