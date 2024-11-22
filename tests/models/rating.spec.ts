import { makeRating } from '../../src/models/rating';
import { ValueError } from '../../src/exceptions/value.error';
import { makeWorkbook } from '../../src/models/workbook';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';

describe('Rating', () => {
  it('is created with default Values', () => {
    const rating = makeRating();
    expect(rating).toMatchObject({
      shortName: 'A1',
      name: 'Human dignity in the supply chain',
      type: 'topic',
      estimations: 0,
      points: 0,
      maxPoints: 0,
      weight: 0,
      isWeightSelectedByUser: false,
      isPositive: true,
    });
  });
  it('should submit estimations', () => {
    const rating = makeRating({
      shortName: 'A1.1',
      type: 'aspect',
      estimations: 0,
      points: 0,
      maxPoints: 50,
      weight: 1,
      isWeightSelectedByUser: false,
      isPositive: true,
    });
    const newRating = rating.submitEstimations(5);
    expect(newRating.estimations).toBe(5);
  });

  it('should submit estimations for negative aspect', () => {
    const rating = makeRating({
      shortName: 'A1.2',
      type: 'aspect',
      estimations: 0,
      points: 0,
      maxPoints: -200,
      weight: 1,
      isWeightSelectedByUser: false,
      isPositive: false,
    });
    const newRating = rating.submitEstimations(-60);
    expect(newRating.estimations).toBe(-60);
  });

  it('should fail to submit estimations outside [0,10] for positive aspect', () => {
    const rating = makeRating({
      shortName: 'A1.1',
      type: 'aspect',
      estimations: 0,
      points: 0,
      maxPoints: 50,
      weight: 1,
      isWeightSelectedByUser: false,
      isPositive: true,
    });
    expect(() => rating.submitEstimations(-1)).toThrow(ValueError);
    expect(() => rating.submitEstimations(11)).toThrow(ValueError);
  });

  it('should ignore validations for estimations if the rating is a topic', () => {
    const rating = makeRating({
      shortName: 'A1',
      type: 'topic',
      estimations: 0,
      points: 0,
      maxPoints: 0,
      weight: 0,
      isWeightSelectedByUser: false,
      isPositive: true,
    });
    expect(() => rating.submitEstimations(11)).not.toThrow();
    expect(() => rating.submitEstimations(-1)).not.toThrow();
  });

  it('should fail to submit estimations outside [-200, 0] for negative aspect', () => {
    const rating = makeRating({
      shortName: 'A1.2',
      type: 'aspect',
      estimations: 0,
      points: 0,
      maxPoints: -200,
      weight: 1,
      isWeightSelectedByUser: false,
      isPositive: false,
    });

    expect(() => rating.submitEstimations(2)).toThrow(ValueError);
    expect(() => rating.submitEstimations(-201)).toThrow(ValueError);
  });

  it('should differ between topic and aspect', () => {
    const topic = makeRating();
    const aspect = makeRating({
      shortName: 'A1.1',
      type: 'aspect',
      estimations: 0,
      points: 0,
      maxPoints: 50,
      weight: 1,
      isWeightSelectedByUser: false,
      isPositive: true,
    });
    expect(topic.isTopic()).toBeTruthy();
    expect(aspect.isTopic()).toBeFalsy();
    expect(aspect.isAspect()).toBeTruthy();
    expect(topic.isAspect()).toBeFalsy();
  });

  it('should return the corresponding stakeholder short name', () => {
    const rating = makeRating({
      shortName: 'A1.1',
      type: 'aspect',
      estimations: 0,
      points: 0,
      maxPoints: 50,
      weight: 1,
      isWeightSelectedByUser: false,
      isPositive: true,
    });
    expect(rating.getStakeholderName()).toBe('A');
  });

  it('should evaluate if rating is an aspect of a topic', () => {
    const rating = makeRating({
      shortName: 'A1.1',
      type: 'aspect',
      estimations: 0,
      points: 0,
      maxPoints: 50,
      weight: 1,
      isWeightSelectedByUser: false,
      isPositive: true,
    });
    expect(rating.isAspectOfTopic('A1')).toBeTruthy();
    expect(rating.isAspectOfTopic('A2')).toBeFalsy();
  });

  describe('is merged', () => {
    it('with request body', () => {
      const rating = makeRating({
        shortName: 'A1',
        type: 'topic',
        estimations: 4,
        isPositive: true,
        isWeightSelectedByUser: false,
        weight: 2,
        maxPoints: 51,
        points: 10,
      });
      const requestBody = {
        shortName: 'A1',
        estimations: 10,
        weight: 0.5,
      };
      const newRating = rating.merge(requestBody, 1);
      expect(newRating).toMatchObject({
        shortName: 'A1',
        estimations: 10,
        isPositive: true,
        isWeightSelectedByUser: true,
        weight: 0.5,
        maxPoints: 51,
        points: 10,
      });
    });
  });

  it('with request body where estimations is 0', () => {
    const rating = makeRating({
      shortName: 'A1',
      type: 'topic',
      estimations: 4,
      isPositive: true,
      isWeightSelectedByUser: false,
      weight: 1,
      maxPoints: 51,
      points: 10,
    });
    const requestBody = {
      shortName: 'A1',
      estimations: 0,
    };
    const newRating = rating.merge(requestBody, 1);
    expect(newRating).toMatchObject({
      shortName: 'A1',
      estimations: 0,
      isPositive: true,
      isWeightSelectedByUser: false,
      weight: 1,
      maxPoints: 51,
      points: 10,
    });
  });

  it('with request body where weight of 0 is selected by user', () => {
    const rating = makeRating({
      shortName: 'A1',
      type: 'topic',
      estimations: 4,
      isPositive: true,
      isWeightSelectedByUser: true,
      weight: 2,
      maxPoints: 51,
      points: 10,
    });
    const requestBody = {
      shortName: 'A1',
      estimations: 10,
      weight: 0,
    };
    const newRating = rating.merge(requestBody, 1);
    expect(newRating).toMatchObject({
      shortName: 'A1',
      estimations: 10,
      isPositive: true,
      isWeightSelectedByUser: true,
      weight: 0,
      maxPoints: 51,
      points: 10,
    });
  });

  it('with request body where weight is reset to default weight', () => {
    const rating = makeRating({
      shortName: 'A1',
      type: 'topic',
      estimations: 4,
      isPositive: true,
      isWeightSelectedByUser: true,
      weight: 2,
      maxPoints: 51,
      points: 10,
    });
    const requestBody = {
      shortName: 'A1',
      estimations: 10,
    };
    const defaultWeight = 1.5;
    const newRating = rating.merge(requestBody, defaultWeight);
    expect(newRating).toMatchObject({
      shortName: 'A1',
      estimations: 10,
      isPositive: true,
      isWeightSelectedByUser: false,
      weight: defaultWeight,
      maxPoints: 51,
      points: 10,
    });
  });

  it('should return rating as json', () => {
    const rating = makeRating({
      shortName: 'D4.1',
      type: 'aspect',
      estimations: 4,
      isPositive: true,
      isWeightSelectedByUser: true,
      weight: 2,
      maxPoints: 51,
      points: 10,
    });

    const workbook = makeWorkbook.fromFile(
      BalanceSheetVersion.v5_0_8,
      BalanceSheetType.Full,
      'de'
    );
    const json = rating.toJson(workbook);
    expect(json).toEqual({
      shortName: 'D4.1',
      name: 'Kund*innen-Mitwirkung, gemeinsame Produktentwicklung und Marktforschung',
      type: 'aspect',
      isPositive: true,
      estimations: 4,
      weight: 2,
      isWeightSelectedByUser: true,
      points: 10,
      maxPoints: 51,
    });
  });
});
describe('Matrix Rating DTO', () => {
  const topicWithZeroValues = makeRating();
  const language = 'en';
  const workbook = makeWorkbook.fromFile(
    BalanceSheetVersion.v5_0_8,
    BalanceSheetType.Full,
    language
  );
  it('has reached points are 30 of 50', () => {
    const topic = makeRating({
      ...topicWithZeroValues,
      points: 30,
      maxPoints: 50,
    });

    const matrixFormat = topic.toMatrixFormat(workbook);
    expect(matrixFormat.points).toBe(30);
    expect(matrixFormat.maxPoints).toBe(50);
  });

  it('has reached points are 31 of 50 (round 30.5982934 of 50.08990)', () => {
    const topic = makeRating({
      ...topicWithZeroValues,
      points: 30.5982934,
      maxPoints: 50.0899,
    });
    const matrixFormat = topic.toMatrixFormat(workbook);
    expect(matrixFormat.points).toBe(31);
    expect(matrixFormat.maxPoints).toBe(50);
  });

  it('has reached points are -100 of 60', () => {
    const topic = makeRating({
      ...topicWithZeroValues,
      points: -100,
      maxPoints: 60,
    });
    const matrixFormat = topic.toMatrixFormat(workbook);
    expect(matrixFormat.points).toBe(-100);
    expect(matrixFormat.maxPoints).toBe(60);
  });

  it('has reached 100%', () => {
    const topic = makeRating({
      ...topicWithZeroValues,
      points: 50,
      maxPoints: 50,
    });
    const matrixFormat = topic.toMatrixFormat(workbook);
    expect(matrixFormat.percentageReached).toBe(100);
  });

  it('has reached 0%', () => {
    const topic = makeRating({
      ...topicWithZeroValues,
      maxPoints: 50,
    });
    const matrixFormat = topic.toMatrixFormat(workbook);
    expect(matrixFormat.percentageReached).toBe(0);
  });

  it('has undefined percentage when division by 0', () => {
    const topic = makeRating({ ...topicWithZeroValues, points: 10 });
    const matrixFormat = topic.toMatrixFormat(workbook);
    expect(matrixFormat.percentageReached).toBeUndefined();
  });

  it('has reached 20% (rounded to the next ten step)', () => {
    const topic = makeRating({
      ...topicWithZeroValues,
      points: 10,
      maxPoints: 60,
    });
    const matrixFormat = topic.toMatrixFormat(workbook);
    expect(matrixFormat.percentageReached).toBe(20);
  });

  it('has unvalid percentage', () => {
    const topic = makeRating({
      ...topicWithZeroValues,
      points: -10,
      maxPoints: 60,
    });
    const matrixFormat = topic.toMatrixFormat(workbook);
    expect(matrixFormat.percentageReached).toBeUndefined();
  });

  it('has shortName A1', () => {
    const matrixFormat = topicWithZeroValues.toMatrixFormat(workbook);
    expect(matrixFormat.shortName).toEqual('A1');
  });

  it('has name A1 name', () => {
    const matrixFormat = topicWithZeroValues.toMatrixFormat(workbook);
    expect(matrixFormat.name).toEqual('Human dignity in the supply chain');
  });

  it('is not applicable', () => {
    const matrixFormat = topicWithZeroValues.toMatrixFormat(workbook);
    expect(matrixFormat.notApplicable).toBeTruthy();
  });

  it('is applicable', () => {
    const topic = makeRating({ ...topicWithZeroValues, weight: 0.5 });
    const matrixFormat = topic.toMatrixFormat(workbook);
    expect(matrixFormat.notApplicable).toBeFalsy();
  });
});
