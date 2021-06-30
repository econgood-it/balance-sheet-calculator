import { strictObjectMapper, arrayMapper } from '@daniel-faber/json-ts';
import { TopicDTO } from './topic.dto';
import { ValidateNested } from 'class-validator';

export class RatingDTO {
  @ValidateNested()
  public readonly topics: TopicDTO[];

  public constructor(topics: TopicDTO[]) {
    this.topics = topics;
  }

  public static readonly fromJSON = strictObjectMapper(
    (accessor) =>
      new RatingDTO(
        accessor.getOptional('topics', arrayMapper(TopicDTO.fromJSON), [])
      )
  );
}
