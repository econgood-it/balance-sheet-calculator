import { makeWeightingProvider } from '../../src/providers/weightingProvider';
import { makeWeighting } from '../../src/models/weighting';

describe('WeightingProvider', () => {
  it('should merge with empty stakeholder weights', () => {
    const weightingProvider = makeWeightingProvider([
      makeWeighting({
        shortName: 'A',
        weight: 1,
      }),
      makeWeighting({
        shortName: 'B',
        weight: 0.5,
      }),
      makeWeighting({
        shortName: 'E',
        weight: 2,
      }),
    ]);
    const merged = weightingProvider.merge([]);
    expect(merged.getAll()).toHaveLength(3);
    expect(merged.getOrFail('A').weight).toEqual(1);
    expect(merged.getOrFail('B').weight).toEqual(0.5);
    expect(merged.getOrFail('E').weight).toEqual(2);
  });

  it('should merge with stakeholder weights', () => {
    const weightings = [
      makeWeighting({ shortName: 'A', weight: 2 }),
      makeWeighting({ shortName: 'C', weight: 1.5 }),
    ];
    const weightingProvider = makeWeightingProvider([
      makeWeighting({
        shortName: 'A',
        weight: 1,
      }),
      makeWeighting({
        shortName: 'B',
        weight: 0.5,
      }),
      makeWeighting({
        shortName: 'E',
        weight: 2,
      }),
    ]);
    const merged = weightingProvider.merge(weightings);
    expect(merged.getAll()).toHaveLength(4);
    expect(merged.getOrFail('A').weight).toEqual(2);
    expect(merged.getOrFail('B').weight).toEqual(0.5);
    expect(merged.getOrFail('C').weight).toEqual(1.5);
    expect(merged.getOrFail('E').weight).toEqual(2);
  });
});
