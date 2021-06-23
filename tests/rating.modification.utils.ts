import { Rating } from '../src/entities/rating';
import { mergeVal } from '../src/merge/merge.utils';

export const modifyAspect = (
  rating: Rating,
  shortName: string,
  estimations?: number,
  weight?: number,
  isWeightSelectedByUser?: boolean
) => {
  const aspect = rating.findAspect(shortName);
  if (aspect) {
    aspect.estimations = mergeVal(aspect.estimations, estimations);
    aspect.weight = mergeVal(aspect.weight, weight);
    aspect.isWeightSelectedByUser = mergeVal(
      aspect.isWeightSelectedByUser,
      isWeightSelectedByUser
    );
  }
};

export const modifyTopic = (
  rating: Rating,
  shortName: string,
  estimations?: number,
  weight?: number,
  isWeightSelectedByUser?: boolean
) => {
  const topic = rating.findTopic(shortName);
  if (topic) {
    topic.estimations = mergeVal(topic.estimations, estimations);
    topic.weight = mergeVal(topic.weight, weight);
    topic.isWeightSelectedByUser = mergeVal(
      topic.isWeightSelectedByUser,
      isWeightSelectedByUser
    );
  }
};
