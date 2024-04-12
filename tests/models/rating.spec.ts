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
    const rating = makeRating();
    const newRating = rating.submitEstimations(5);
    expect(newRating.estimations).toBe(5);
  });

  it('should fail to submit estimations if estimations are negative but aspect is positive', () => {
    const rating = makeRating();
    expect(() => rating.submitEstimations(-1)).toThrow(ValueError);
  });

  it('should fail to submit estimations if estimations are positive but aspect is negative', () => {
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
