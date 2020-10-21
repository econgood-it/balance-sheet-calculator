import { strictObjectMapper, arrayMapper } from '@daniel-faber/json-ts';
import { TopicDTOUpdate } from './topicUpdate.dto';

export class RatingDTOUpdate {
  public constructor(
    public readonly topics: TopicDTOUpdate[]
  ) { }

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
