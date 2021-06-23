import { RatingsDTO } from '../../../src/dto/createAndUpdate/ratings.dto';
import { RatingDTO } from '../../../src/dto/createAndUpdate/rating.dto';
import { TopicDTO } from '../../../src/dto/createAndUpdate/topic.dto';
import { AspectDTO } from '../../../src/dto/createAndUpdate/aspect.dto';
import { toJsObject } from '../../to.js.object';

describe('RatingsDTO', () => {
  it('is created from json and is converted to RatingDTO', () => {
    const json = {
      ratings: [{ shortName: 'A1.1', estimations: 5, weight: 1 }],
    };
    const ratingsDto = RatingsDTO.fromJSON(json);

    const expectedRatingDTO = new RatingDTO([
      new TopicDTO('A1', undefined, [new AspectDTO('A1.1', 5, 1)]),
    ]);

    expect(ratingsDto.toRatingDTO()).toMatchObject(
      toJsObject(expectedRatingDTO)
    );
  });

  it('is created from another json and is converted to RatingDTO', () => {
    const json = {
      ratings: [
        { shortName: 'A1.1', estimations: 5, weight: 1 },
        { shortName: 'D1', weight: 1.5 },
        { shortName: 'D1.2', estimations: 3, weight: 0.5 },
        { shortName: 'E2.1', estimations: 3 },
      ],
    };

    const ratingsDto = RatingsDTO.fromJSON(toJsObject(json));

    const expectedRatingDTO = new RatingDTO([
      new TopicDTO('A1', undefined, [new AspectDTO('A1.1', 5, 1)]),
      new TopicDTO('D1', 1.5, [new AspectDTO('D1.2', 3, 0.5)]),
      new TopicDTO('E2', undefined, [new AspectDTO('E2.1', 3, undefined)]),
    ]);

    expect(ratingsDto.toRatingDTO()).toMatchObject(
      toJsObject(expectedRatingDTO)
    );
  });
});
