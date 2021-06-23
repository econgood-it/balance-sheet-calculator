import { strictObjectMapper } from '@daniel-faber/json-ts';
import { CompanyFactsDTOCreate } from './company.facts.create.dto';
import { RatingFactory } from '../../factories/rating.factory';
import { BalanceSheet } from '../../entities/balanceSheet';
import {
  BalanceSheetType,
  balanceSheetTypeFromJSON,
  BalanceSheetVersion,
  balanceSheetVersionFromJSON,
} from '../../entities/enums';
import { ValidateNested } from 'class-validator';
import { Translations } from '../../entities/Translations';
import { RatingDTO } from '../createAndUpdate/rating.dto';
import { RatingsDTO } from '../createAndUpdate/ratings.dto';
import { RatingWithDtoMerger } from '../../merge/rating.with.dto.merger';

export class BalanceSheetDTOCreate {
  @ValidateNested()
  public readonly companyFacts: CompanyFactsDTOCreate;

  @ValidateNested()
  public readonly rating: RatingDTO | undefined;

  public constructor(
    public readonly type: BalanceSheetType,
    public readonly version: BalanceSheetVersion,
    companyFacts: CompanyFactsDTOCreate,
    rating: RatingDTO | undefined
  ) {
    this.companyFacts = companyFacts;
    this.rating = rating;
  }

  public static readonly fromJSON = (json: any) => {
    let rating: RatingDTO | undefined;
    if ('ratings' in json) {
      rating = RatingsDTO.fromJSON({ ratings: json.ratings }).toRatingDTO();
      delete json.ratings;
    }
    // 'ratings' in json ? RatingsDTO.fromJSON(json).toRatingDTO() : undefined;
    const jsonParser = strictObjectMapper((accessor) => {
      return new BalanceSheetDTOCreate(
        accessor.get('type', balanceSheetTypeFromJSON),
        accessor.get('version', balanceSheetVersionFromJSON),
        accessor.getOptional(
          'companyFacts',
          CompanyFactsDTOCreate.fromJSON,
          CompanyFactsDTOCreate.fromJSON({})
        ),
        rating
      );
    });
    return jsonParser(json);
  };

  public async toBalanceSheet(
    language: keyof Translations
  ): Promise<BalanceSheet> {
    const rating = await RatingFactory.createDefaultRating(
      this.type,
      this.version
    );
    if (this.rating !== undefined) {
      const ratingWithDtoMerger = new RatingWithDtoMerger();
      ratingWithDtoMerger.mergeRating(rating, this.rating, this.type);
    }
    return new BalanceSheet(
      undefined,
      this.type,
      this.version,
      this.companyFacts.toCompanyFacts(language),
      rating
    );
  }
}
