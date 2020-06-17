import { strictObjectMapper, expectString, expectNumber, arrayMapper } from '@daniel-faber/json-ts';
import { Topic } from './topic';

export class EmployeesFraction {
  public constructor(
    public readonly countryCode: string,
    public readonly percentage: number
  ) { }

  public static readonly fromJSON = strictObjectMapper(
    accessor =>
      new EmployeesFraction(
        accessor.get('countryCode', expectString),
        accessor.get('percentage', expectNumber)
      )
  );
}
