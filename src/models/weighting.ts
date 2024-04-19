import deepFreeze from 'deep-freeze';

export type Weighting = {
  shortName: string;
  weight: number;
};

export function makeWeighting(opts: Weighting): Weighting {
  return deepFreeze({
    ...opts,
  });
}
