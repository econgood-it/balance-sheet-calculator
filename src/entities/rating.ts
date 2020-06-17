import { strictObjectMapper, expectString, expectNumber, arrayMapper } from '@daniel-faber/json-ts';
import { Topic } from './topic';

export class Rating {
  public constructor(
    public readonly topics: Topic[]
  ) { }

  public static readonly fromJSON = strictObjectMapper(
    accessor =>
      new Rating(
        accessor.get('topics', arrayMapper(Topic.fromJSON)))
  );
}
