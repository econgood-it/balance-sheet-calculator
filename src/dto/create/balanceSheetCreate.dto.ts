import { strictObjectMapper } from '@daniel-faber/json-ts';
import { CompanyFactsDTOCreate } from './companyFactsCreate.dto';
import { RatingDTOCreate } from './ratingCreate.dto';
import { RatingFactory } from '../../factories/rating.factory';
import { BalanceSheet } from '../../entities/balanceSheet';
import { BalanceSheetType, balanceSheetTypeFromJSON } from '../../entities/enums';

export class BalanceSheetDTOCreate {
  public constructor(
    public readonly type: BalanceSheetType,
    public readonly companyFacts: CompanyFactsDTOCreate,
    public readonly rating: RatingDTOCreate,
  ) {
  }

  public static readonly fromJSON = strictObjectMapper(
    (accessor) => {
      const type = accessor.get('type', balanceSheetTypeFromJSON);
      return new BalanceSheetDTOCreate(
        type,
        accessor.get('companyFacts', CompanyFactsDTOCreate.fromJSON),
        accessor.getOptional('rating', RatingDTOCreate.fromJSON, RatingFactory.createDefaultRating(type))
      )
    }
  );

  public toBalanceSheet(): BalanceSheet {
    return new BalanceSheet(undefined, this.type, this.companyFacts.toCompanyFacts(), this.rating.toRating())
  }
}

