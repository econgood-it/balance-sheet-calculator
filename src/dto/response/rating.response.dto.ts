import { Rating } from '../../entities/rating';
import { TopicDTOResponse } from './topic.response.dto';
import { Translations } from '../../entities/Translations';
export class RatingDTOResponse {
  public constructor(
    public readonly id: number | undefined,
    public readonly topics: TopicDTOResponse[]
  ) {}

  public static fromRating(
    rating: Rating,
    language: keyof Translations
  ): RatingDTOResponse {
    return new RatingDTOResponse(
      rating.id,
      rating.topics.map((t) => TopicDTOResponse.fromTopic(t, language))
    );
  }
}
