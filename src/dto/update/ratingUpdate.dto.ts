import { strictObjectMapper, arrayMapper } from '@daniel-faber/json-ts';
import { TopicDTOUpdate } from './topicUpdate.dto';
import { ValidateNested } from 'class-validator';

export class RatingDTOUpdate {
  @ValidateNested()
  public readonly topics: TopicDTOUpdate[]
  public constructor(
    topics: TopicDTOUpdate[]
  ) {
    this.topics = topics;
  }

  public static readonly fromJSONCompact = strictObjectMapper(
    accessor =>
      new RatingDTOUpdate(
        accessor.getOptional('topics', arrayMapper(TopicDTOUpdate.fromJSONCompact), [])
      )
  )

  public static readonly fromJSONFull = strictObjectMapper(
    accessor =>
      new RatingDTOUpdate(
        accessor.getOptional('topics', arrayMapper(TopicDTOUpdate.fromJSONFull), [])
      )
  )

}
