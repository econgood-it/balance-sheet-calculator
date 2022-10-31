import { MainOriginOfOtherSuppliers } from '../../models/company.facts';

export class MainOriginOfOtherSuppliersDTOResponse {
  constructor(
    public readonly countryCode: string,
    public readonly costs: number
  ) {}

  public static fromMainOriginOfOtherSuppliers(
    mainOriginOfOtherSuppliers: MainOriginOfOtherSuppliers
  ): MainOriginOfOtherSuppliersDTOResponse {
    return new MainOriginOfOtherSuppliersDTOResponse(
      mainOriginOfOtherSuppliers.countryCode,
      mainOriginOfOtherSuppliers.costs
    );
  }
}
