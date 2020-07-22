import { strictObjectMapper, arrayMapper } from '@daniel-faber/json-ts';
import { TopicDTOCreate } from './topicCreate.dto';
import { Rating } from '../../entities/rating';

export class RatingDTOCreate {
  public constructor(
    public readonly topics: TopicDTOCreate[]
  ) { }

  public static readonly fromJSON = strictObjectMapper(
    accessor =>
      new RatingDTOCreate(
        accessor.get('topics', arrayMapper(TopicDTOCreate.fromJSON)))
  );

  public toRating(): Rating {
    return new Rating(undefined, this.topics.map(t => t.toTopic()))
  }

}
