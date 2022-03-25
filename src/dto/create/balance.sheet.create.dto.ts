import { arrayMapper, strictObjectMapper } from '@daniel-faber/json-ts';
import { CompanyFactsDTOCreate } from './company.facts.create.dto';
import { RatingsFactory } from '../../factories/ratings.factory';
import { BalanceSheet } from '../../entities/balanceSheet';
import {
  BalanceSheetType,
  balanceSheetTypeFromJSON,
  BalanceSheetVersion,
  balanceSheetVersionFromJSON,
} from '../../entities/enums';
import { ValidateNested } from 'class-validator';
import { Translations } from '../../entities/Translations';
import { RatingsWithDtoMerger } from '../../merge/ratingsWithDtoMerger';
import { User } from '../../entities/user';
import { RatingDTO } from '../createAndUpdate/ratingDTO';

export class BalanceSheetDTOCreate {
  @ValidateNested()
  public readonly companyFacts: CompanyFactsDTOCreate;

  @ValidateNested()
  public readonly ratings: RatingDTO[];

  public constructor(
    public readonly type: BalanceSheetType,
    public readonly version: BalanceSheetVersion,
    companyFacts: CompanyFactsDTOCreate,
    ratings: RatingDTO[]
  ) {
    this.companyFacts = companyFacts;
    this.ratings = ratings;
  }

  public static readonly fromJSON = strictObjectMapper(
    (accessor) =>
      new BalanceSheetDTOCreate(
        accessor.get('type', balanceSheetTypeFromJSON),
        accessor.get('version', balanceSheetVersionFromJSON),
        accessor.getOptional(
          'companyFacts',
          CompanyFactsDTOCreate.fromJSON,
          CompanyFactsDTOCreate.fromJSON({})
        ),
        accessor.getOptional('ratings', arrayMapper(RatingDTO.fromJSON), [])
      )
  );

  public async toBalanceSheet(
    language: keyof Translations,
    users: User[]
  ): Promise<BalanceSheet> {
    const mergedRatings = await RatingsFactory.createDefaultRatings(
      this.type,
      this.version
    );
    const ratingWithDtoMerger = new RatingsWithDtoMerger();
    ratingWithDtoMerger.mergeRatings(mergedRatings, this.ratings, this.type);

    return new BalanceSheet(
      undefined,
      this.type,
      this.version,
      this.companyFacts.toCompanyFacts(language),
      mergedRatings,
      users
    );
  }
}
