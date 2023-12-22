import { mergeVal } from './merge.utils';
import { Rating } from '../models/rating';

import * as _ from 'lodash';
import { RatingRequestBodySchema } from '@ecogood/e-calculator-schemas/dist/rating.dto';
import { z } from 'zod';

type RatingRequestBody = z.infer<typeof RatingRequestBodySchema>;

export function mergeRatingsWithRequestBodies(
  ratings: Rating[],
  ratingRequestBodies: RatingRequestBody[]
): Rating[] {
  return ratings.map((r) => {
    const foundRatingRequestBody = ratingRequestBodies.find(
      (rb) => rb.shortName === r.shortName
    );
    return foundRatingRequestBody
      ? mergeRatingWithRequestBody(r, foundRatingRequestBody)
      : r;
  });
}

function mergeRatingWithRequestBody(
  rating: Rating,
  ratingRequestBody: RatingRequestBody
) {
  if (rating.shortName === ratingRequestBody.shortName) {
    return {
      ..._.merge(rating, ratingRequestBody),
      ...(rating.isPositive && ratingRequestBody.weight !== undefined
        ? {
            isWeightSelectedByUser: true,
            weight: mergeVal(rating.weight, ratingRequestBody.weight),
          }
        : {
            isWeightSelectedByUser: false,
            weight: rating.weight,
          }),
    };
  } else {
    return rating;
  }
}
