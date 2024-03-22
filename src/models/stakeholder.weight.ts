import deepFreeze from 'deep-freeze';

export type StakeholderWeight = {
  shortName: string;
  weight: number;
};

export function makeStakeholderWeight(
  opts: StakeholderWeight
): StakeholderWeight {
  return deepFreeze({
    ...opts,
  });
}
