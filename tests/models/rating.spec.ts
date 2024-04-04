import { makeRating } from '../../src/models/rating';

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
  it('should override fields', () => {
    const rating = makeRating();
    const newRating = rating.withFields({
      shortName: 'B1',
      name: 'Different name',
      estimations: 1,
      points: 1,
      maxPoints: 1,
      weight: 1,
      isWeightSelectedByUser: true,
      isPositive: false,
    });
    expect(newRating).toMatchObject({
      shortName: 'B1',
      name: 'Different name',
      estimations: 1,
      points: 1,
      maxPoints: 1,
      weight: 1,
      isWeightSelectedByUser: true,
      isPositive: false,
    });
  });
  it('should evaluate if rating is a topic', () => {
    const rating = makeRating();
    expect(rating.isTopic()).toBeTruthy();
    expect(rating.withFields({ shortName: 'A1.1' }).isTopic()).toBeFalsy();
  });
  it('should evaluate if rating is an aspect', () => {
    const rating = makeRating();
    expect(rating.isAspect()).toBeFalsy();
    expect(rating.withFields({ shortName: 'A1.1' }).isAspect()).toBeTruthy();
  });
  it('should evaluate if rating is an aspect of a topic', () => {
    const rating = makeRating().withFields({ shortName: 'A1.1' });
    expect(rating.isAspectOfTopic('A1')).toBeTruthy();
    expect(rating.isAspectOfTopic('A2')).toBeFalsy();
  });
});
