import { SupplyFraction } from '../../entities/supplyFraction';
import { Translations } from '../../entities/Translations';

export class SupplyFractionDTOResponse {
  constructor(
    public readonly countryCode: string,
    public readonly industryCode: string,
    public readonly costs: number
  ) {}

  public static fromSupplyFraction(
    supplyFraction: SupplyFraction,
    language: keyof Translations
  ): SupplyFractionDTOResponse {
    return new SupplyFractionDTOResponse(
      supplyFraction.countryCode,
      supplyFraction.industryCode,
      supplyFraction.costs
    );
  }
}
