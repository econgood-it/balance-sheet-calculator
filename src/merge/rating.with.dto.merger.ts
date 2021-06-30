import { Rating } from '../entities/rating';
import { RatingDTO } from '../dto/createAndUpdate/rating.dto';
import { BalanceSheetType } from '../entities/enums';
import { Topic } from '../entities/topic';
import { TopicDTO } from '../dto/createAndUpdate/topic.dto';
import { Aspect } from '../entities/aspect';
import { mergeVal } from './merge.utils';

export class RatingWithDtoMerger {
  public mergeRating(
    rating: Rating,
    ratingDTO: RatingDTO,
    balanceSheetType: BalanceSheetType
  ) {
    if (ratingDTO.topics) {
      for (const topicDTOUpdate of ratingDTO.topics) {
        const topic: Topic | undefined = rating.topics.find(
          (t) => t.shortName === topicDTOUpdate.shortName
        );
        if (topic) {
          this.mergeTopic(topic, topicDTOUpdate);
        } else {
          throw Error(`Cannot find topic ${topicDTOUpdate.shortName}`);
        }
      }
    }
  }

  public mergeTopic(topic: Topic, topicDTO: TopicDTO) {
    for (const aspectDTOUpdate of topicDTO.aspects) {
      const aspect: Aspect | undefined = topic.aspects.find(
        (a) => a.shortName === aspectDTOUpdate.shortName
      );
      if (aspect) {
        aspect.estimations = mergeVal(
          aspect.estimations,
          aspectDTOUpdate.estimations
        );
        if (aspect.isPositive && aspectDTOUpdate.weight !== undefined) {
          aspect.isWeightSelectedByUser = true;
          aspect.weight = mergeVal(aspect.weight, aspectDTOUpdate.weight);
        }
      } else {
        throw Error(`Cannot find aspect ${aspectDTOUpdate.shortName}`);
      }
    }
    topic.isWeightSelectedByUser = !!topicDTO.weight;
    topic.weight = mergeVal(topic.weight, topicDTO.weight);
  }
}
