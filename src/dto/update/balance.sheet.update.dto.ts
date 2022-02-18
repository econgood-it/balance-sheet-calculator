import { strictObjectMapper, expectNumber } from '@daniel-faber/json-ts';
import { CompanyFactsDTOUpdate } from './company.facts.update.dto';
import { RatingDTO } from '../createAndUpdate/rating.dto';
import { ValidateNested, IsOptional } from 'class-validator';
import { RatingsDTO } from '../createAndUpdate/ratings.dto';

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

  public static readonly fromJSON = (json: any) => {
    let rating: RatingDTO | undefined;
    if ('ratings' in json) {
      rating = RatingsDTO.fromJSON({ ratings: json.ratings }).toRatingDTO();
      delete json.ratings;
    }
    const jsonParser = strictObjectMapper((accessor) => {
      return new BalanceSheetDTOUpdate(
        accessor.get('id', expectNumber),
        accessor.getOptional('companyFacts', CompanyFactsDTOUpdate.fromJSON),
        rating || accessor.getOptional('rating', RatingDTO.fromJSON)
      );
    });
    return jsonParser(json);
  };
}
