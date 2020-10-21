import { strictObjectMapper, expectString, expectNumber } from '@daniel-faber/json-ts';

export class SupplyFractionDTOUpdate {

  constructor(
    public readonly countryCode: string,
    public readonly costs: number,
  ) { }

  public static readonly fromJSON = strictObjectMapper(
    accessor =>
      new SupplyFractionDTOUpdate(
        accessor.get('countryCode', expectString),
        accessor.get('costs', expectNumber),
      )
  );
}
