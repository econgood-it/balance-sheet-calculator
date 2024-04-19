import { Weighting } from '../models/weighting';
import deepFreeze from 'deep-freeze';
import _ from 'lodash';

export interface WeightingProvider {
  getOrFail(shortName: string): Weighting;
  getAll(): Weighting[];
  merge(stakeholderWeights: Weighting[]): WeightingProvider;
}

export function makeWeightingProvider(
  weightings: Weighting[]
): WeightingProvider {
  function getOrFail(shortName: string): Weighting {
    const weighting = weightings.find((sw) => sw.shortName === shortName);
    if (!weighting) {
      throw new Error(`Weighting with shortName ${shortName} not found`);
    }
    return weighting;
  }

  function getAll(): Weighting[] {
    return weightings;
  }

  function merge(weightingsToMerge: Weighting[]): WeightingProvider {
    return makeWeightingProvider(
      _.unionBy(weightingsToMerge, weightings, 'shortName')
    );
  }
  return deepFreeze({
    getOrFail,
    merge,
    getAll,
  });
}
