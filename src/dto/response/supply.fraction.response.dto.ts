import { Translations } from '../../entities/Translations';
import { SupplyFraction } from '../../models/company.facts';

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
