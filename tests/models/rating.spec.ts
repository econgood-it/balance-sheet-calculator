import { makeRating } from '../../src/models/rating';
import { ValueError } from '../../src/exceptions/value.error';

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
    const newRating = rating.submitPositiveEstimations(5);
    expect(newRating.estimations).toBe(5);
    expect(newRating.points).toBe(25);
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
    const topicMaxPoints = 50;
    const newRating = rating.submitNegativeEstimations(-60, topicMaxPoints);
    expect(newRating.estimations).toBe(-60);
    expect(newRating.points).toBe(-60);
  });

  it('should fail if submitPositiveEstimations is called for negative aspect', () => {
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
    expect(() => rating.submitPositiveEstimations(0)).toThrow(ValueError);
  });

  it('should fail if submitNegativeEstimations is called for positive aspect', () => {
    const rating = makeRating();
    expect(() => rating.submitNegativeEstimations(0, 50)).toThrow(ValueError);
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
    expect(() => rating.submitPositiveEstimations(-1)).toThrow(ValueError);
    expect(() => rating.submitPositiveEstimations(11)).toThrow(ValueError);
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
    expect(() => rating.submitPositiveEstimations(11)).not.toThrow();
    expect(() => rating.submitPositiveEstimations(-1)).not.toThrow();
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
    const topicMaxPoints = 50;

    expect(() => rating.submitNegativeEstimations(2, topicMaxPoints)).toThrow(
      ValueError
    );
    expect(() =>
      rating.submitNegativeEstimations(-201, topicMaxPoints)
    ).toThrow(ValueError);
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
});
