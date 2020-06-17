import { strictObjectMapper, expectString, expectNumber, arrayMapper } from '@daniel-faber/json-ts';
import { Topic } from './topic';

export class SupplyFraction {
  public constructor(
    public readonly countryCode: string,
    public readonly costs: number
  ) { }

  public static readonly fromJSON = strictObjectMapper(
    accessor =>
      new SupplyFraction(
        accessor.get('countryCode', expectString),
        accessor.get('costs', expectNumber)
      )
  );
}
