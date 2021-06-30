import { strictObjectMapper, expectNumber } from '@daniel-faber/json-ts';
import { CompanyFactsDTOUpdate } from './company.facts.update.dto';
import { RatingDTO } from '../createAndUpdate/rating.dto';
import { ValidateNested, IsOptional } from 'class-validator';

export class BalanceSheetDTOUpdate {
  @IsOptional()
  @ValidateNested()
  public readonly rating?: RatingDTO;

  @IsOptional()
  @ValidateNested()
  public readonly companyFacts?: CompanyFactsDTOUpdate;

  public constructor(
    public readonly id: number,
    companyFacts?: CompanyFactsDTOUpdate,
    rating?: RatingDTO
  ) {
    this.rating = rating;
    this.companyFacts = companyFacts;
  }

  public static readonly fromJSON = strictObjectMapper(
    (accessor) =>
      new BalanceSheetDTOUpdate(
        accessor.get('id', expectNumber),
        accessor.getOptional('companyFacts', CompanyFactsDTOUpdate.fromJSON),
        accessor.getOptional('rating', RatingDTO.fromJSON)
      )
  );
}
