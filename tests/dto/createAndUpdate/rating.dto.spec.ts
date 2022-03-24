import { RatingDTO } from '../../../src/dto/createAndUpdate/ratingDTO';

describe('RatingDTO', () => {
  it('is created from json as aspect', () => {
    const json = {
      shortName: 'A1.1',
      estimations: 5,
      weight: 1,
    };
    const topicOrAspectDTOCreate: RatingDTO = RatingDTO.fromJSON(json);
    expect(topicOrAspectDTOCreate).toMatchObject({ ...json });
  });

  it('is created from json as topic', () => {
    const json = {
      shortName: 'A1',
      estimations: 5,
      weight: 1,
    };
    const topicOrAspectDTOCreate: RatingDTO = RatingDTO.fromJSON(json);
    expect(topicOrAspectDTOCreate).toMatchObject({ ...json });
  });
});
