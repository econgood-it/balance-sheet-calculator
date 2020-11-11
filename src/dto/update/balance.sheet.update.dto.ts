import { strictObjectMapper, expectNumber, JsonObjectAccessor } from '@daniel-faber/json-ts';
import { CompanyFactsDTOUpdate } from './company.facts.update.dto';
import { RatingDTOUpdate } from './rating.update.dto';
import { BalanceSheetType } from '../../entities/enums';
import {ValidateNested, IsOptional} from 'class-validator';

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

  public static readonly fromJSON = strictObjectMapper(
    accessor => new BalanceSheetDTOUpdate(
      accessor.get('id', expectNumber),
      accessor.getOptional('companyFacts', CompanyFactsDTOUpdate.fromJSON),
      accessor.getOptional('rating', RatingDTOUpdate.fromJSON)
    )
  );
}

