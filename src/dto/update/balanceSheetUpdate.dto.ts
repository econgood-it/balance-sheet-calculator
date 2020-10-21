import { strictObjectMapper, expectNumber, JsonObjectAccessor } from '@daniel-faber/json-ts';
import { CompanyFactsDTOUpdate } from './companyFactsUpdate.dto';
import { RatingDTOUpdate } from './ratingUpdate.dto';
import { BalanceSheetType } from '../../entities/enums';


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

