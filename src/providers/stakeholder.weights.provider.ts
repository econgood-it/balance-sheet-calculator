import { StakeholderWeight } from '../models/stakeholder.weight';
import deepFreeze from 'deep-freeze';
import _ from 'lodash';

export interface StakeholderWeightsProvider {
  getOrFail(shortName: string): StakeholderWeight;
  getAll(): StakeholderWeight[];
  merge(stakeholderWeights: StakeholderWeight[]): StakeholderWeightsProvider;
}

export function makeStakeholderWeightsProvider(
  stakeholderWeights: StakeholderWeight[]
): StakeholderWeightsProvider {
  function getOrFail(shortName: string): StakeholderWeight {
    const stakeholderWeight = stakeholderWeights.find(
      (sw) => sw.shortName === shortName
    );
    if (!stakeholderWeight) {
      throw new Error(
        `Stakeholder weight with shortName ${shortName} not found`
      );
    }
    return stakeholderWeight;
  }

  function getAll(): StakeholderWeight[] {
    return stakeholderWeights;
  }

  function merge(
    stakeholderWeightsToMerge: StakeholderWeight[]
  ): StakeholderWeightsProvider {
    return makeStakeholderWeightsProvider(
      _.unionBy(stakeholderWeightsToMerge, stakeholderWeights, 'shortName')
    );
  }
  return deepFreeze({
    getOrFail,
    merge,
    getAll,
  });
}
