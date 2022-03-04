import { BalanceSheet } from '../../entities/balanceSheet';
import { CompanyFactsDTOResponse } from './company.facts.response.dto';
import { RatingDTOResponse } from './rating.response.dto';
import { Translations } from '../../entities/Translations';
import { BalanceSheetType, BalanceSheetVersion } from '../../entities/enums';
import { TopicOrAspectResponseDTO } from './topic.or.aspect.dto';
import { RatingsDTOResponse } from './ratings.response.dto';

export class BalanceSheetDTOResponse {
  public constructor(
    public readonly id: number | undefined,
    public readonly type: BalanceSheetType,
    public readonly version: BalanceSheetVersion,
    public readonly rating: RatingDTOResponse | undefined,
    public readonly ratings: TopicOrAspectResponseDTO[] | undefined,
    public readonly companyFacts: CompanyFactsDTOResponse
  ) {}

  public static fromBalanceSheet(
    balanceSheet: BalanceSheet,
    language: keyof Translations,
    format: string = 'long'
  ) {
    if (format === 'short') {
      return new BalanceSheetDTOResponse(
        balanceSheet.id,
        balanceSheet.type,
        balanceSheet.version,
        undefined,
        RatingsDTOResponse.fromRating(balanceSheet.rating, language).ratings,
        CompanyFactsDTOResponse.fromCompanyFacts(
          balanceSheet.companyFacts,
          language
        )
      );
    } else {
      return new BalanceSheetDTOResponse(
        balanceSheet.id,
        balanceSheet.type,
        balanceSheet.version,
        RatingDTOResponse.fromRating(balanceSheet.rating, language),
        undefined,
        CompanyFactsDTOResponse.fromCompanyFacts(
          balanceSheet.companyFacts,
          language
        )
      );
    }
  }
}
