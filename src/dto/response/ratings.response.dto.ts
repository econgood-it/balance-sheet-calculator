import { Rating } from '../../entities/rating';
import { Translations } from '../../entities/Translations';
import { TopicOrAspectResponseDTO } from './topic.or.aspect.dto';

export class RatingsDTOResponse {
  public constructor(public readonly ratings: TopicOrAspectResponseDTO[]) {}

  public static fromRating(
    rating: Rating,
    language: keyof Translations
  ): RatingsDTOResponse {
    const ratings = [];
    for (const topic of rating.topics) {
      ratings.push(TopicOrAspectResponseDTO.fromTopicOrAspect(topic, language));
      for (const aspect of topic.aspects) {
        ratings.push(
          TopicOrAspectResponseDTO.fromTopicOrAspect(aspect, language)
        );
      }
    }
    return new RatingsDTOResponse(ratings);
  }
}
