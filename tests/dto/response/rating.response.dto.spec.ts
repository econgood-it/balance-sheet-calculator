import { RatingResponseDTO } from '../../../src/dto/response/rating.response.dto';
import { Rating } from '../../../src/models/balance.sheet';

jest.mock('../../../src/i18n', () => ({
  init: () => {},
  use: () => {},
  t: (k: string) => 'Menschenwürde in der Zulieferkette',
}));

describe('RatingResponseDTO', () => {
  it('is created from topic', async () => {
    const rating: Rating = {
      shortName: 'A1',
      name: 'v5:compact.A1',
      estimations: 2,
      points: 3,
      maxPoints: 51,
      weight: 5,
      isWeightSelectedByUser: true,
      isPositive: true,
    };
    const topicOrAspectResponseDTO = RatingResponseDTO.fromRating(rating, 'de');
    expect(topicOrAspectResponseDTO).toBeDefined();
    expect(topicOrAspectResponseDTO).toMatchObject({
      shortName: 'A1',
      name: 'Menschenwürde in der Zulieferkette',
      type: 'topic',
      isPositive: true,
    });
  });

  it('is created from aspect', async () => {
    const rating = {
      shortName: 'A1.1',
      name: 'v5:compact.A1.1',
      estimations: 2,
      points: 3,
      maxPoints: 51,
      weight: 5,
      isWeightSelectedByUser: true,
      isPositive: true,
    };
    const topicOrAspectResponseDTO = RatingResponseDTO.fromRating(rating, 'de');
    expect(topicOrAspectResponseDTO).toBeDefined();
    expect(topicOrAspectResponseDTO).toMatchObject({
      shortName: 'A1.1',
      name: 'Menschenwürde in der Zulieferkette',
      isPositive: true,
      type: 'aspect',
    });
  });
});
