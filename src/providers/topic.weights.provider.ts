import deepFreeze from 'deep-freeze';
import _ from 'lodash';

export type TopicWeight = {
  shortName: string;
  weight: number;
};

export function makeTopicWeight(opts: TopicWeight): TopicWeight {
  return deepFreeze({ ...opts });
}

export interface TopicWeightsProvider {
  getOrFail(shortName: string): TopicWeight;
  merge(topicWeights: TopicWeight[]): TopicWeightsProvider;
  getAll(): TopicWeight[];
}

export function makeTopicWeightsProvider(
  topicWeights: TopicWeight[]
): TopicWeightsProvider {
  function getOrFail(shortName: string): TopicWeight {
    const topicWeight = topicWeights.find((sw) => sw.shortName === shortName);
    if (!topicWeight) {
      throw new Error(`Topic weight with shortName ${shortName} not found`);
    }
    return topicWeight;
  }

  function merge(topicWeightsToMerge: TopicWeight[]): TopicWeightsProvider {
    return makeTopicWeightsProvider(
      _.unionBy(topicWeightsToMerge, topicWeights, 'shortName')
    );
  }

  function getAll(): TopicWeight[] {
    return topicWeights;
  }

  return deepFreeze({
    getOrFail,
    merge,
    getAll,
  });
}
