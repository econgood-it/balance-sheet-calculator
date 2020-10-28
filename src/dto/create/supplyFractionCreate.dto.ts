import { strictObjectMapper, expectString, expectNumber } from '@daniel-faber/json-ts';
import { SupplyFraction } from '../../entities/supplyFraction';
import {IsAlpha, IsNumber, IsUppercase, Length, Min} from "class-validator";

export class SupplyFractionDTOCreate {

  @IsAlpha()
  @Length(3, 3)
  @IsUppercase()
  public readonly countryCode: string;
  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly costs: number;
  constructor(countryCode: string, costs: number) {
    this.countryCode = countryCode;
    this.costs = costs;
  }

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
