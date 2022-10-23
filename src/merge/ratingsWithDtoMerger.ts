import { mergeVal } from './merge.utils';
import { Rating } from '../models/rating';
import { RatingRequestBody } from '../dto/rating.dto';

export class RatingsWithDtoMerger {
  public mergeRatings(
    ratings: Rating[],
    ratingRequestBodies: RatingRequestBody[]
  ): Rating[] {
    ratingRequestBodies.forEach((ratingDTO) => {
      const rating: Rating | undefined = ratings.find(
        (t) => t.shortName === ratingDTO.shortName
      );
      if (!rating) {
        throw Error(`Cannot find rating ${ratingDTO.shortName}`);
      }
    });
    return ratings.map((rating) => {
      const ratingRequestBody: RatingRequestBody | undefined =
        ratingRequestBodies.find((t) => t.shortName === rating.shortName);
      return ratingRequestBody
        ? this.mergeRating(rating, ratingRequestBody)
        : rating;
    });
  }

  public mergeRating(
    rating: Rating,
    ratingRequestBody: RatingRequestBody
  ): Rating {
    return {
      ...rating,
      estimations: mergeVal(rating.estimations, ratingRequestBody.estimations),
      ...(rating.isPositive &&
        ratingRequestBody.weight !== undefined && {
          isWeightSelectedByUser: true,
          weight: mergeVal(rating.weight, ratingRequestBody.weight),
        }),
    };
  }
}
