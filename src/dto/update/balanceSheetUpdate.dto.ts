import { strictObjectMapper, expectNumber, JsonObjectAccessor } from '@daniel-faber/json-ts';
import { CompanyFactsDTOCreate } from '../create/companyFactsCreate.dto';
import { RatingDTOCreate } from '../create/ratingCreate.dto';
import { CompanyFactsDTOUpdate } from './companyFactsUpdate.dto';
import { RatingDTOUpdate } from './ratingUpdate.dto';
import { BalanceSheet } from '../../entities/balanceSheet';
import { BalanceSheetService } from '../../services/balanceSheet.service';
import { BalanceSheetType } from '../../entities/enums';
import { RatingFactory } from '../../factories/rating.factory';

export class BalanceSheetDTOUpdate {
  public constructor(
    public readonly id: number,
    public readonly companyFacts?: CompanyFactsDTOUpdate,
    public readonly rating?: RatingDTOUpdate,
  ) {
  }

  public static readonly fromJSONCompact = strictObjectMapper(
    (accessor) => BalanceSheetDTOUpdate.fromJSON(accessor, BalanceSheetType.Compact)
  );

  public static readonly fromJSONFull = strictObjectMapper(
    (accessor) => BalanceSheetDTOUpdate.fromJSON(accessor, BalanceSheetType.Full)
  );

  private static fromJSON(accessor: JsonObjectAccessor, balanceSheetType: BalanceSheetType) {
    const ratingFromJson = balanceSheetType === BalanceSheetType.Compact ? RatingDTOUpdate.fromJSONCompact : RatingDTOUpdate.fromJSONFull;
    return new BalanceSheetDTOUpdate(
      accessor.get('id', expectNumber),
      accessor.getOptional('companyFacts', CompanyFactsDTOUpdate.fromJSON),
      accessor.getOptional('rating', ratingFromJson)
    )
  }
}

