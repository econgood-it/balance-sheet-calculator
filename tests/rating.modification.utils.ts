import { Rating } from '../src/entities/rating';
import { mergeVal } from '../src/merge/merge.utils';

export const modifyRating = (
  ratings: Rating[],
  shortName: string,
  estimations?: number,
  weight?: number,
  isWeightSelectedByUser?: boolean
) => {
  const rating = ratings.find((r: Rating) => r.shortName === shortName);
  if (rating) {
    rating.estimations = mergeVal(rating.estimations, estimations);
    rating.weight = mergeVal(rating.weight, weight);
    rating.isWeightSelectedByUser = mergeVal(
      rating.isWeightSelectedByUser,
      isWeightSelectedByUser
    );
  }
};
