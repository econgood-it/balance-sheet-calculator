import { RatingResponseDTO } from '../../../src/dto/response/rating.response.dto';
import { Rating } from '../../../src/models/rating';

describe('RatingResponseDTO', () => {
  it('is created from topic', async () => {
    const rating: Rating = {
      shortName: 'A1',
      name: 'Human dignity in the supply chain',
      estimations: 2,
      points: 3,
      maxPoints: 51,
      weight: 5,
      isWeightSelectedByUser: true,
      isPositive: true,
    };
    const topicOrAspectResponseDTO = RatingResponseDTO.fromRating(rating);
    expect(topicOrAspectResponseDTO).toBeDefined();
    expect(topicOrAspectResponseDTO).toMatchObject({
      shortName: 'A1',
      name: 'Human dignity in the supply chain',
      type: 'topic',
      isPositive: true,
    });
  });

  it('is created from aspect', async () => {
    const rating = {
      shortName: 'A1.1',
      name: 'Human dignity in the supply chain',
      estimations: 2,
      points: 3,
      maxPoints: 51,
      weight: 5,
      isWeightSelectedByUser: true,
      isPositive: true,
    };
    const topicOrAspectResponseDTO = RatingResponseDTO.fromRating(rating);
    expect(topicOrAspectResponseDTO).toBeDefined();
    expect(topicOrAspectResponseDTO).toMatchObject({
      shortName: 'A1.1',
      name: 'Human dignity in the supply chain',
      isPositive: true,
      type: 'aspect',
    });
  });
});
