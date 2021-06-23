import { strictObjectMapper, arrayMapper } from '@daniel-faber/json-ts';
import { TopicOrAspectDTO } from './topic.or.aspect.dto';
import { RatingDTO } from './rating.dto';
import { TopicDTO } from './topic.dto';
import { AspectDTO } from './aspect.dto';

export class RatingsDTO {
  public readonly topicsOrAspects: TopicOrAspectDTO[];

  public constructor(topicsOrAspects: TopicOrAspectDTO[]) {
    this.topicsOrAspects = topicsOrAspects;
  }

  public static readonly fromJSON = strictObjectMapper(
    (accessor) =>
      new RatingsDTO(
        accessor.getOptional(
          'ratings',
          arrayMapper(TopicOrAspectDTO.fromJSON),
          []
        )
      )
  );

  public toRatingDTO(): RatingDTO {
    const topics = new Map<string, TopicDTO>();
    for (const topicOrAspect of this.topicsOrAspects) {
      if (!topicOrAspect.isAspect) {
        topics.set(
          topicOrAspect.shortName,
          new TopicDTO(topicOrAspect.shortName, topicOrAspect.weight, [])
        );
      } else {
        const aspect = new AspectDTO(
          topicOrAspect.shortName,
          topicOrAspect.estimations,
          topicOrAspect.weight
        );
        const shortNameTopic = topicOrAspect.shortName.substring(0, 2);
        const topicOfAspect = topics.get(shortNameTopic);
        if (topicOfAspect !== undefined) {
          topicOfAspect.aspects.push(aspect);
        } else {
          topics.set(
            shortNameTopic,
            new TopicDTO(shortNameTopic, undefined, [aspect])
          );
        }
      }
    }
    return new RatingDTO(Array.from(topics.values()));
  }
}
