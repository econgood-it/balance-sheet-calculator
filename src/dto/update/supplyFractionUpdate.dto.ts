import { strictObjectMapper, expectString, expectNumber } from '@daniel-faber/json-ts';

export class SupplyFractionDTOUpdate {

  constructor(
    public readonly id: number | undefined,
    public readonly countryCode: string,
    public readonly costs: number,
  ) { }

  public static readonly fromJSON = strictObjectMapper(
    accessor =>
      new SupplyFractionDTOUpdate(
        accessor.getOptional('id', expectNumber),
        accessor.get('countryCode', expectString),
        accessor.get('costs', expectNumber),
      )
  );
}
