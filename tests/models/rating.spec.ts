import { makeRating } from '../../src/models/rating';
import { ValueError } from '../../src/exceptions/value.error';

jest.mock('../../src/i18n', () => ({
  init: () => {},
  use: () => {},
  t: (k: string) =>
    k === 'Working conditions and social impact in the supply chain'
      ? 'Arbeitsbedingungen und gesellschaftliche Auswirkungen in der Zulieferkette'
      : k,
}));

describe('Rating', () => {
  it('is created with default Values', () => {
    const rating = makeRating();
    expect(rating).toMatchObject({
      shortName: 'A1',
      name: 'Human dignity in the supply chain',
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
      name: 'Working conditions and social impact in the supply chain',
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
      name: 'Negative aspect: violation of human dignity in the supply chain',
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
      name: 'Working conditions and social impact in the supply chain',
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
      name: 'Human dignity in the supply chain',
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
      name: 'Negative aspect: violation of human dignity in the supply chain',
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
      name: 'Working conditions and social impact in the supply chain',
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
      name: 'Working conditions and social impact in the supply chain',
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
      name: 'Working conditions and social impact in the supply chain',
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

  describe('is merged with request body', () => {
    it('with request body', () => {
      const rating = makeRating({
        shortName: 'A1',
        name: 'A1 name',
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
      const newRating = rating.merge(requestBody);
      expect(newRating).toMatchObject({
        shortName: 'A1',
        name: 'A1 name',
        estimations: 10,
        isPositive: true,
        isWeightSelectedByUser: true,
        weight: 0.5,
        maxPoints: 51,
        points: 10,
      });
    });

    it('with request boyd where weight is not selected by user', () => {
      const rating = makeRating({
        shortName: 'A1',
        name: 'A1 name',
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
      const newRating = rating.merge(requestBody);
      expect(newRating).toMatchObject({
        shortName: 'A1',
        name: 'A1 name',
        estimations: 10,
        isPositive: true,
        isWeightSelectedByUser: false,
        weight: 2,
        maxPoints: 51,
        points: 10,
      });
    });
  });

  it('should return rating as json', () => {
    const rating = makeRating({
      shortName: 'D4.1',
      name: 'Working conditions and social impact in the supply chain',
      estimations: 4,
      isPositive: true,
      isWeightSelectedByUser: true,
      weight: 2,
      maxPoints: 51,
      points: 10,
    });

    const json = rating.toJson('de');
    expect(json).toEqual({
      shortName: 'D4.1',
      name: 'Arbeitsbedingungen und gesellschaftliche Auswirkungen in der Zulieferkette',
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
