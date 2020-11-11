import { strictObjectMapper, arrayMapper } from '@daniel-faber/json-ts';
import { TopicDTOUpdate } from './topic.update.dto';
import { ValidateNested } from 'class-validator';

export class RatingDTOUpdate {
  @ValidateNested()
  public readonly topics: TopicDTOUpdate[]
  public constructor(
    topics: TopicDTOUpdate[]
  ) {
    this.topics = topics;
  }

  public static readonly fromJSON = strictObjectMapper(
    accessor =>
      new RatingDTOUpdate(
        accessor.getOptional('topics', arrayMapper(TopicDTOUpdate.fromJSON), [])
      )
  )


}
