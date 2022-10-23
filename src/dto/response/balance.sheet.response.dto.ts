import { CompanyFactsDTOResponse } from './company.facts.response.dto';
import { Translations } from '../../entities/Translations';
import { RatingResponseDTO } from './rating.response.dto';
import {
  BalanceSheet,
  BalanceSheetType,
  BalanceSheetVersion,
} from '../../models/balance.sheet';
import { sortRatings } from '../../models/rating';

export class BalanceSheetDTOResponse {
  public constructor(
    public readonly id: number | undefined,
    public readonly type: BalanceSheetType,
    public readonly version: BalanceSheetVersion,
    public readonly ratings: RatingResponseDTO[] | undefined,
    public readonly companyFacts: CompanyFactsDTOResponse
  ) {}

  public static fromBalanceSheet(
    balanceSheetId: number | undefined,
    balanceSheet: BalanceSheet,
    language: keyof Translations
  ) {
    return new BalanceSheetDTOResponse(
      balanceSheetId,
      balanceSheet.type,
      balanceSheet.version,
      sortRatings(balanceSheet.ratings).map((r) =>
        RatingResponseDTO.fromRating(r, language)
      ),
      CompanyFactsDTOResponse.fromCompanyFacts(
        balanceSheet.companyFacts,
        language
      )
    );
  }
}
