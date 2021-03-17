import {SupplyFraction} from "../../entities/supplyFraction";
import {Aspect} from "../../entities/aspect";
import {Translations} from "../../entities/Translations";
import {Column, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {CompanyFacts} from "../../entities/companyFacts";

export class SupplyFractionDTOResponse {

  constructor(
    public readonly id: number | undefined,
    public readonly countryCode: string,
    public readonly industryCode: string,
    public readonly costs: number,
  ) {
  }

  public static fromSupplyFraction(supplyFraction: SupplyFraction, language: keyof Translations): SupplyFractionDTOResponse {
    return new SupplyFractionDTOResponse(
      supplyFraction.id,
      supplyFraction.countryCode,
      supplyFraction.industryCode, supplyFraction.costs);
  }
}
