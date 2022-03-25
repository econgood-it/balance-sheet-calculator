import { Rating } from '../entities/rating';
import { RatingDTO } from '../dto/createAndUpdate/ratingDTO';
import { BalanceSheetType } from '../entities/enums';
import { mergeVal } from './merge.utils';

export class RatingsWithDtoMerger {
  public mergeRatings(
    ratings: Rating[],
    ratingDTOs: RatingDTO[],
    balanceSheetType: BalanceSheetType
  ) {
    for (const ratingDTO of ratingDTOs) {
      const rating: Rating | undefined = ratings.find(
        (t) => t.shortName === ratingDTO.shortName
      );
      if (rating) {
        this.mergeRating(rating, ratingDTO);
      } else {
        throw Error(`Cannot find rating ${ratingDTO.shortName}`);
      }
    }
  }

  public mergeRating(rating: Rating, ratingDTO: RatingDTO) {
    rating.estimations = mergeVal(rating.estimations, ratingDTO.estimations);
    if (rating.isPositive && ratingDTO.weight !== undefined) {
      rating.isWeightSelectedByUser = true;
      rating.weight = mergeVal(rating.weight, ratingDTO.weight);
    }
  }
}
