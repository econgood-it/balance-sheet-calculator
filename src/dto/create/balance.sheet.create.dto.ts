import { arrayMapper, strictObjectMapper } from '@daniel-faber/json-ts';
import { CompanyFactsDTOCreate } from './company.facts.create.dto';
import { RatingsFactory } from '../../factories/ratings.factory';
import { ValidateNested } from 'class-validator';
import { RatingsWithDtoMerger } from '../../merge/ratingsWithDtoMerger';
import { RatingDTO } from '../createAndUpdate/ratingDTO';
import {
  BalanceSheet,
  BalanceSheetType,
  balanceSheetTypeFromJSON,
  BalanceSheetVersion,
  balanceSheetVersionFromJSON,
} from '../../models/balance.sheet';

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

  public async toBalanceSheet(): Promise<BalanceSheet> {
    const defaultRatings = await RatingsFactory.createDefaultRatings(
      this.type,
      this.version
    );
    const ratingWithDtoMerger = new RatingsWithDtoMerger();

    return {
      type: this.type,
      version: this.version,
      companyFacts: this.companyFacts.toCompanyFacts(),
      ratings: ratingWithDtoMerger.mergeRatings(defaultRatings, this.ratings),
    };
  }
}
