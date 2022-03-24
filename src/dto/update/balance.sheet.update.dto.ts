import { arrayMapper, strictObjectMapper } from '@daniel-faber/json-ts';
import { CompanyFactsDTOUpdate } from './company.facts.update.dto';
import { RatingDTO } from '../createAndUpdate/ratingDTO';
import { ValidateNested, IsOptional } from 'class-validator';

export class BalanceSheetDTOUpdate {
  @IsOptional()
  @ValidateNested()
  public readonly ratings: RatingDTO[];

  @IsOptional()
  @ValidateNested()
  public readonly companyFacts?: CompanyFactsDTOUpdate;

  public constructor(
    ratings: RatingDTO[],
    companyFacts?: CompanyFactsDTOUpdate
  ) {
    this.ratings = ratings;
    this.companyFacts = companyFacts;
  }

  public static readonly fromJSON = strictObjectMapper(
    (accessor) =>
      new BalanceSheetDTOUpdate(
        accessor.getOptional('ratings', arrayMapper(RatingDTO.fromJSON), []),
        accessor.getOptional('companyFacts', CompanyFactsDTOUpdate.fromJSON)
      )
  );
}
