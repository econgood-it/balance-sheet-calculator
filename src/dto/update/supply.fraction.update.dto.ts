import {
  strictObjectMapper,
  expectString,
  expectNumber,
} from '@daniel-faber/json-ts';
import { IsAlpha, IsNumber, IsUppercase, Length, Min } from 'class-validator';

export class SupplyFractionDTOUpdate {
  @IsAlpha()
  @Length(3, 3)
  @IsUppercase()
  public readonly countryCode: string;

  @IsAlpha()
  @Length(1, 4)
  public readonly industryCode: string;

  @Min(0)
  @IsNumber({ maxDecimalPlaces: 2 })
  public readonly costs: number;

  constructor(industryCode: string, countryCode: string, costs: number) {
    this.industryCode = industryCode;
    this.countryCode = countryCode;
    this.costs = costs;
  }

  public static readonly fromJSON = strictObjectMapper(
    (accessor) =>
      new SupplyFractionDTOUpdate(
        accessor.get('industryCode', expectString),
        accessor.get('countryCode', expectString),
        accessor.get('costs', expectNumber)
      )
  );
}
