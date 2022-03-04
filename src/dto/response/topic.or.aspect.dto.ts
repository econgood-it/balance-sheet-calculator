import { staticTranslate, Translations } from '../../entities/Translations';
import { Topic } from '../../entities/topic';
import { Aspect } from '../../entities/aspect';

export class TopicOrAspectResponseDTO {
  public constructor(
    public readonly shortName: string,
    public readonly name: string,
    public readonly weight: number,
    public readonly estimations: number,
    public readonly isPositive: boolean | undefined
  ) {}

  public static fromTopicOrAspect(
    topicOrAspect: Topic | Aspect,
    language: keyof Translations
  ): TopicOrAspectResponseDTO {
    return new TopicOrAspectResponseDTO(
      topicOrAspect.shortName,
      staticTranslate(language, topicOrAspect.name),
      topicOrAspect.weight,
      topicOrAspect.estimations,
      topicOrAspect instanceof Aspect ? topicOrAspect.isPositive : undefined
    );
  }
}
