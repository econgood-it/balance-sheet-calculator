import { strictObjectMapper } from '@daniel-faber/json-ts';
import { CompanyFactsDTOCreate } from './companyFactsCreate.dto';
import { RatingDTOCreate } from './ratingCreate.dto';
import { RatingFactory } from '../../factories/rating.factory';
import { BalanceSheet } from '../../entities/balanceSheet';

export class BalanceSheetDTOCreate {
  public constructor(
    public readonly companyFacts: CompanyFactsDTOCreate,
    public readonly rating: RatingDTOCreate,
  ) {
  }

  public static readonly fromJSON = strictObjectMapper(
    (accessor) =>
      new BalanceSheetDTOCreate(
        accessor.get('companyFacts', CompanyFactsDTOCreate.fromJSON),
        accessor.getOptional('rating', RatingDTOCreate.fromJSON, RatingFactory.createDefaultRating())
      )
  );

  public toBalanceSheet(): BalanceSheet {
    return new BalanceSheet(undefined, this.companyFacts.toCompanyFacts(), this.rating.toRating())
  }
}

