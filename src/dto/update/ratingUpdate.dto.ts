import { strictObjectMapper, arrayMapper, expectNumber } from '@daniel-faber/json-ts';
import { TopicDTOCreate } from '../create/topicCreate.dto';
import { TopicDTOUpdate } from './topicUpdate.dto';

export class RatingDTOUpdate {
  public constructor(
    public readonly id: number,
    public readonly topics: TopicDTOUpdate[]
  ) { }

  public static readonly fromJSONCompact = strictObjectMapper(
    accessor =>
      new RatingDTOUpdate(
        accessor.get('id', expectNumber),
        accessor.getOptional('topics', arrayMapper(TopicDTOUpdate.fromJSONCompact), [])
      )
  )

  public static readonly fromJSONFull = strictObjectMapper(
    accessor =>
      new RatingDTOUpdate(
        accessor.get('id', expectNumber),
        accessor.getOptional('topics', arrayMapper(TopicDTOUpdate.fromJSONFull), [])
      )
  )

}
