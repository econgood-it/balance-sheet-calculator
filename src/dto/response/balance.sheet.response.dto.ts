import { BalanceSheet } from '../../entities/balanceSheet';
import { CompanyFactsDTOResponse } from './company.facts.response.dto';
import { Translations } from '../../entities/Translations';
import { BalanceSheetType, BalanceSheetVersion } from '../../entities/enums';
import { RatingResponseDTO } from './rating.response.dto';

export class BalanceSheetDTOResponse {
  public constructor(
    public readonly id: number | undefined,
    public readonly type: BalanceSheetType,
    public readonly version: BalanceSheetVersion,
    public readonly ratings: RatingResponseDTO[] | undefined,
    public readonly companyFacts: CompanyFactsDTOResponse
  ) {}

  public static fromBalanceSheet(
    balanceSheet: BalanceSheet,
    language: keyof Translations
  ) {
    return new BalanceSheetDTOResponse(
      balanceSheet.id,
      balanceSheet.type,
      balanceSheet.version,
      balanceSheet.ratings.map((r) =>
        RatingResponseDTO.fromRating(r, language)
      ),
      CompanyFactsDTOResponse.fromCompanyFacts(
        balanceSheet.companyFacts,
        language
      )
    );
  }
}
