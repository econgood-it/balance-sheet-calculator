import { MatrixRatingDto } from '../../../src/dto/matrix/matrix.rating.dto';
import { Rating } from '../../../src/models/balance.sheet';

jest.mock('../../../src/i18n', () => ({
  init: () => {},
  use: () => {},
  t: (k: string) => {
    return k === 'v5:compact.A1' ? 'Menschenwürde in der Zulieferkette' : '';
  },
}));

describe('Matrix Rating DTO', () => {
  let topicWithZeroValues: Rating;
  const lng = 'de';

  beforeEach(() => {
    topicWithZeroValues = {
      shortName: 'A1',
      name: 'v5:compact.A1',
      estimations: 0,
      points: 0,
      maxPoints: 0,
      weight: 0,
      isWeightSelectedByUser: false,
      isPositive: true,
    };
  });

  it('is created from topic', () => {
    const matrixTopicDTO = MatrixRatingDto.fromRating(topicWithZeroValues, lng);
    expect(matrixTopicDTO).toBeDefined();
  });

  it('has reached points are 30 of 50', () => {
    const topic = { ...topicWithZeroValues, points: 30, maxPoints: 50 };
    const matrixTopicDTO = MatrixRatingDto.fromRating(topic, lng);
    expect(matrixTopicDTO.points).toBe(30);
    expect(matrixTopicDTO.maxPoints).toBe(50);
  });

  it('has reached points are 31 of 50 (round 30.5982934 of 50.08990)', () => {
    const topic = {
      ...topicWithZeroValues,
      points: 30.5982934,
      maxPoints: 50.0899,
    };
    const matrixTopicDTO = MatrixRatingDto.fromRating(topic, lng);
    expect(matrixTopicDTO.points).toBe(31);
    expect(matrixTopicDTO.maxPoints).toBe(50);
  });

  it('has reached points are -100 of 60', () => {
    const topic = { ...topicWithZeroValues, points: -100, maxPoints: 60 };
    const matrixTopicDTO = MatrixRatingDto.fromRating(topic, lng);
    expect(matrixTopicDTO.points).toBe(-100);
    expect(matrixTopicDTO.maxPoints).toBe(60);
  });

  it('has reached 100%', () => {
    const topic = { ...topicWithZeroValues, points: 50, maxPoints: 50 };

    const matrixTopicDTO = MatrixRatingDto.fromRating(topic, lng);
    expect(matrixTopicDTO.percentageReached).toBe(100);
  });

  it('has reached 0%', () => {
    const topic = { ...topicWithZeroValues, maxPoints: 50 };

    const matrixTopicDTO = MatrixRatingDto.fromRating(topic, lng);
    expect(matrixTopicDTO.percentageReached).toBe(0);
  });

  it('has undefined percentage when division by 0', () => {
    const topic = { ...topicWithZeroValues, points: 10 };
    const matrixTopicDTO = MatrixRatingDto.fromRating(topic, lng);
    expect(matrixTopicDTO.percentageReached).toBeUndefined();
  });

  it('has reached 20% (rounded to the next ten step)', () => {
    const topic = { ...topicWithZeroValues, points: 10, maxPoints: 60 };

    const matrixTopicDTO = MatrixRatingDto.fromRating(topic, lng);
    expect(matrixTopicDTO.percentageReached).toBe(20);
  });

  it('has unvalid percentage', () => {
    const topic = { ...topicWithZeroValues, points: -10, maxPoints: 60 };
    const matrixTopicDTO = MatrixRatingDto.fromRating(topic, lng);
    expect(matrixTopicDTO.percentageReached).toBeUndefined();
  });

  it('has shortName A1', () => {
    const matrixTopicDTO = MatrixRatingDto.fromRating(topicWithZeroValues, lng);
    expect(matrixTopicDTO.shortName).toBe('A1');
  });

  it('has name A1 name', () => {
    const matrixTopicDTO = MatrixRatingDto.fromRating(topicWithZeroValues, lng);
    expect(matrixTopicDTO.name).toBe('Menschenwürde in der Zulieferkette');
  });

  it('is not applicable', () => {
    const matrixTopicDTO = MatrixRatingDto.fromRating(topicWithZeroValues, lng);
    expect(matrixTopicDTO.notApplicable).toBeTruthy();
  });

  it('is applicable', () => {
    const topic = { ...topicWithZeroValues, weight: 0.5 };

    const matrixTopicDTO = MatrixRatingDto.fromRating(topic, lng);
    expect(matrixTopicDTO.notApplicable).toBeFalsy();
  });
});
