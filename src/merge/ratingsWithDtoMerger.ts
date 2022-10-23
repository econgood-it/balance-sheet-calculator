import { RatingDTO } from '../dto/createAndUpdate/ratingDTO';
import { mergeVal } from './merge.utils';
import { Rating } from '../models/rating';
import { RatingRequestBody } from '../dto/rating.dto';

export class RatingsWithDtoMerger {
  public mergeRatings(
    ratings: Rating[],
    ratingDTOs: RatingDTO[] | RatingRequestBody[]
  ): Rating[] {
    ratingDTOs.forEach((ratingDTO) => {
      const rating: Rating | undefined = ratings.find(
        (t) => t.shortName === ratingDTO.shortName
      );
      if (!rating) {
        throw Error(`Cannot find rating ${ratingDTO.shortName}`);
      }
    });
    return ratings.map((rating) => {
      const ratingDTO: RatingDTO | RatingRequestBody | undefined =
        ratingDTOs.find((t) => t.shortName === rating.shortName);
      return ratingDTO ? this.mergeRating(rating, ratingDTO) : rating;
    });
  }

  public mergeRating(
    rating: Rating,
    ratingDTO: RatingDTO | RatingRequestBody
  ): Rating {
    return {
      ...rating,
      estimations: mergeVal(rating.estimations, ratingDTO.estimations),
      ...(rating.isPositive &&
        ratingDTO.weight !== undefined && {
          isWeightSelectedByUser: true,
          weight: mergeVal(rating.weight, ratingDTO.weight),
        }),
    };
  }
}
