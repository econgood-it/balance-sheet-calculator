import { strictObjectMapper, expectString, expectNumber } from '@daniel-faber/json-ts';
import { SupplyFraction } from '../../entities/supplyFraction';

export class SupplyFractionDTOCreate {

  constructor(
    public readonly countryCode: string,
    public readonly costs: number,
  ) { }

  public static readonly fromJSON = strictObjectMapper(
    accessor =>
      new SupplyFractionDTOCreate(
        accessor.get('countryCode', expectString),
        accessor.get('costs', expectNumber),
      )
  );
  public toSupplyFraction(): SupplyFraction {
    return new SupplyFraction(undefined, this.countryCode, this.costs);
  }
}
