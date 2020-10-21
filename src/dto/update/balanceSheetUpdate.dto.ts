import { strictObjectMapper, expectNumber, JsonObjectAccessor } from '@daniel-faber/json-ts';
import { CompanyFactsDTOUpdate } from './companyFactsUpdate.dto';
import { RatingDTOUpdate } from './ratingUpdate.dto';
import { BalanceSheetType } from '../../entities/enums';
import { ValidateNested, IsOptional } from 'class-validator';

export class BalanceSheetDTOUpdate {
  @IsOptional()
  @ValidateNested()
  public readonly rating?: RatingDTOUpdate;
  @IsOptional()
  @ValidateNested()
  public readonly companyFacts?: CompanyFactsDTOUpdate;
  public constructor(
    public readonly id: number,
    companyFacts?: CompanyFactsDTOUpdate,
    rating?: RatingDTOUpdate,
  ) {
    this.rating = rating;
    this.companyFacts = companyFacts;
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

