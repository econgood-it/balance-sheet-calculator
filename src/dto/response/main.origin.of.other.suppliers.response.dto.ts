import { Translations } from '../../entities/Translations';
import { MainOriginOfOtherSuppliers } from '../../models/balance.sheet';

export class MainOriginOfOtherSuppliersDTOResponse {
  constructor(
    public readonly countryCode: string,
    public readonly costs: number
  ) {}

  public static fromMainOriginOfOtherSuppliers(
    mainOriginOfOtherSuppliers: MainOriginOfOtherSuppliers,
    language: keyof Translations
  ): MainOriginOfOtherSuppliersDTOResponse {
    return new MainOriginOfOtherSuppliersDTOResponse(
      mainOriginOfOtherSuppliers.countryCode,
      mainOriginOfOtherSuppliers.costs
    );
  }
}
