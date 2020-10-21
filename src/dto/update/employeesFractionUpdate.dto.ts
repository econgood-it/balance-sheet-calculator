import { strictObjectMapper, expectString, expectNumber } from '@daniel-faber/json-ts';

export class EmployeesFractionDTOUpdate {

  public constructor(
    public readonly countryCode: string,
    public readonly percentage: number
  ) { }

  public static readonly fromJSON = strictObjectMapper(
    accessor =>
      new EmployeesFractionDTOUpdate(
        accessor.get('countryCode', expectString),
        accessor.get('percentage', expectNumber)
      )
  );
}
