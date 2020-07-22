import { strictObjectMapper, expectNumber } from '@daniel-faber/json-ts';
import { CompanyFactsDTOCreate } from '../create/companyFactsCreate.dto';
import { RatingDTOCreate } from '../create/ratingCreate.dto';
import { CompanyFactsDTOUpdate } from './companyFactsUpdate.dto';
import { RatingDTOUpdate } from './ratingUpdate.dto';
import { BalanceSheet } from '../../entities/balanceSheet';
import { BalanceSheetService } from '../../services/balanceSheet.service';

export class BalanceSheetDTOUpdate {
  public constructor(
    public readonly id: number,
    public readonly companyFacts?: CompanyFactsDTOUpdate,
    public readonly rating?: RatingDTOUpdate,
  ) {
  }

  public static readonly fromJSON = strictObjectMapper(
    (accessor) =>
      new BalanceSheetDTOUpdate(
        accessor.get('id', expectNumber),
        accessor.getOptional('companyFacts', CompanyFactsDTOUpdate.fromJSON),
        accessor.getOptional('rating', RatingDTOUpdate.fromJSON)
      )
  );
}

