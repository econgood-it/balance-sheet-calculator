import { staticTranslate, Translations } from '../../entities/Translations';
import { Topic } from '../../entities/topic';
import { Aspect } from '../../entities/aspect';

export class TopicOrAspectResponseDTO {
  public constructor(
    public readonly shortName: string,
    public readonly name: string,
    public readonly weight: number,
    public readonly estimations: number
  ) {}

  public static fromTopicOrAspect(
    topic: Topic | Aspect,
    language: keyof Translations
  ): TopicOrAspectResponseDTO {
    return new TopicOrAspectResponseDTO(
      topic.shortName,
      staticTranslate(language, topic.name),
      topic.weight,
      topic.estimations
    );
  }
}
