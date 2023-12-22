import { mergeRatingsWithRequestBodies } from '../../src/merge/ratingsWithDtoMerger';
import { Rating } from '../../src/models/rating';

describe('mergeRatingsWithRequestBodies', () => {
  it('should merge ratings with ratings from the request body', () => {
    const ratings: Rating[] = [
      {
        shortName: 'A1',
        name: 'A1 name',
        estimations: 4,
        isPositive: true,
        isWeightSelectedByUser: false,
        weight: 2,
        maxPoints: 51,
        points: 10,
      },
      {
        shortName: 'A2',
        name: 'A2 name',
        estimations: 1,
        isPositive: true,
        isWeightSelectedByUser: false,
        weight: 1.5,
        maxPoints: 27,
        points: 9,
      },
    ];

    const ratingRequestBodies = [
      {
        shortName: 'A1',
        estimations: 10,
        weight: 0.5,
      },
    ];

    const result = mergeRatingsWithRequestBodies(ratings, ratingRequestBodies);

    expect(result).toMatchObject([
      {
        shortName: 'A1',
        name: 'A1 name',
        estimations: 10,
        isPositive: true,
        isWeightSelectedByUser: true,
        weight: 0.5,
        maxPoints: 51,
        points: 10,
      },
      {
        shortName: 'A2',
        name: 'A2 name',
        estimations: 1,
        isPositive: true,
        isWeightSelectedByUser: false,
        weight: 1.5,
        maxPoints: 27,
        points: 9,
      },
    ]);
  });
  it('should merge ratings with ratings where weight is not selected by user', () => {
    const ratings: Rating[] = [
      {
        shortName: 'A1',
        name: 'A1 name',
        estimations: 4,
        isPositive: true,
        isWeightSelectedByUser: true,
        weight: 2,
        maxPoints: 51,
        points: 10,
      },
      {
        shortName: 'A2',
        name: 'A2 name',
        estimations: 1,
        isPositive: true,
        isWeightSelectedByUser: false,
        weight: 1.5,
        maxPoints: 27,
        points: 9,
      },
    ];

    const ratingRequestBodies = [
      {
        shortName: 'A1',
        estimations: 10,
      },
    ];

    const result = mergeRatingsWithRequestBodies(ratings, ratingRequestBodies);

    expect(result).toMatchObject([
      {
        shortName: 'A1',
        name: 'A1 name',
        estimations: 10,
        isPositive: true,
        isWeightSelectedByUser: false,
        weight: 2,
        maxPoints: 51,
        points: 10,
      },
      {
        shortName: 'A2',
        name: 'A2 name',
        estimations: 1,
        isPositive: true,
        isWeightSelectedByUser: false,
        weight: 1.5,
        maxPoints: 27,
        points: 9,
      },
    ]);
  });
});
