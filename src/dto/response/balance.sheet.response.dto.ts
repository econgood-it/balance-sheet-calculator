import {BalanceSheet} from "../../entities/balanceSheet";
import {CompanyFactsDTOResponse} from "./company.facts.response.dto";
import {RatingDTOResponse} from "./rating.response.dto";
import {Translations} from "../../entities/Translations";
import {BalanceSheetType, BalanceSheetVersion} from "../../entities/enums";

export class BalanceSheetDTOResponse {

  public constructor(
    public readonly id: number | undefined,
    public readonly type: BalanceSheetType,
    public readonly version: BalanceSheetVersion,
    public readonly rating: RatingDTOResponse,
    public readonly companyFacts: CompanyFactsDTOResponse
  ) {
  }

  public static fromBalanceSheet(balanceSheet: BalanceSheet, language: keyof Translations) {
    return new BalanceSheetDTOResponse(balanceSheet.id,
      balanceSheet.type, balanceSheet.version,
      RatingDTOResponse.fromRating(balanceSheet.rating, language),
      CompanyFactsDTOResponse.fromCompanyFacts(balanceSheet.companyFacts, language));
  }

}

