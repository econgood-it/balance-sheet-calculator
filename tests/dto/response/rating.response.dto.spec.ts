import { Rating } from '../../../src/entities/rating';
import { RatingResponseDTO } from '../../../src/dto/response/rating.response.dto';

jest.mock('../../../src/i18n', () => ({
  init: () => {},
  use: () => {},
  t: (k: string) => 'Menschenwürde in der Zulieferkette',
}));

describe('RatingResponseDTO', () => {
  it('is created from topic', async () => {
    const rating = new Rating(
      undefined,
      'A1',
      'v5:compact.A1',
      2,
      3,
      51,
      5,
      true,
      true
    );
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
    const rating = new Rating(
      undefined,
      'A1.1',
      'v5:compact.A1',
      2,
      3,
      51,
      5,
      true,
      true
    );
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
