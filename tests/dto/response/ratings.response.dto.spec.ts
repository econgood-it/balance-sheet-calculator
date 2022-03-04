import { Topic } from '../../../src/entities/topic';
import { Rating } from '../../../src/entities/rating';
import { RatingsDTOResponse } from '../../../src/dto/response/ratings.response.dto';
import { Aspect } from '../../../src/entities/aspect';

jest.mock('../../../src/i18n', () => ({
  init: () => {},
  use: () => {},
  t: (k: string) => 'Menschenwürde in der Zulieferkette',
}));

describe('RatingsTopicResponseDTO', () => {
  it('is created from rating', async () => {
    const topicA1 = new Topic(
      undefined,
      'A1',
      'v5:compact.A1',
      2,
      3,
      51,
      5,
      true,
      [new Aspect(undefined, 'A1.1', 'v5:compact.A1', 2, 3, 51, 5, true, true)]
    );
    const topicA2 = new Topic(
      undefined,
      'A2',
      'v5:compact.A1',
      2,
      3,
      51,
      5,
      true,
      []
    );
    const rating = new Rating(undefined, [topicA1, topicA2]);
    const ratingsResponseDTO = RatingsDTOResponse.fromRating(rating, 'de');
    expect(ratingsResponseDTO).toBeDefined();
    expect(ratingsResponseDTO.ratings).toMatchObject([
      {
        shortName: 'A1',
        name: 'Menschenwürde in der Zulieferkette',
      },
      { shortName: 'A1.1' },
      {
        shortName: 'A2',
      },
    ]);
  });
});
