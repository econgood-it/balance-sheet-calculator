import deepFreeze from 'deep-freeze';

export type TopicWeight = {
  shortName: string;
  weight: number;
};

export function makeTopicWeight(opts: TopicWeight): TopicWeight {
  return deepFreeze({ ...opts });
}

export interface TopicWeightsProvider {
  getOrFail(shortName: string): TopicWeight;
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

  function getAll(): TopicWeight[] {
    return topicWeights;
  }

  return deepFreeze({
    getOrFail,
    getAll,
  });
}
