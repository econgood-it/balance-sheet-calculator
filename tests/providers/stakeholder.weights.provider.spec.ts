import { makeStakeholderWeightsProvider } from '../../src/providers/stakeholder.weights.provider';
import { makeStakeholderWeight } from '../../src/models/stakeholder.weight';

describe('StakeholderWeightsProvider', () => {
  it('should merge with empty stakeholder weights', () => {
    const stakeholderWeightsProvider = makeStakeholderWeightsProvider([
      makeStakeholderWeight({
        shortName: 'A',
        weight: 1,
      }),
      makeStakeholderWeight({
        shortName: 'B',
        weight: 0.5,
      }),
      makeStakeholderWeight({
        shortName: 'E',
        weight: 2,
      }),
    ]);
    const merged = stakeholderWeightsProvider.merge([]);
    expect(merged.getAll()).toHaveLength(3);
    expect(merged.getOrFail('A').weight).toEqual(1);
    expect(merged.getOrFail('B').weight).toEqual(0.5);
    expect(merged.getOrFail('E').weight).toEqual(2);
  });

  it('should merge with stakeholder weights', () => {
    const stakeholderWeights = [
      makeStakeholderWeight({ shortName: 'A', weight: 2 }),
      makeStakeholderWeight({ shortName: 'C', weight: 1.5 }),
    ];
    const stakeholderWeightsProvider = makeStakeholderWeightsProvider([
      makeStakeholderWeight({
        shortName: 'A',
        weight: 1,
      }),
      makeStakeholderWeight({
        shortName: 'B',
        weight: 0.5,
      }),
      makeStakeholderWeight({
        shortName: 'E',
        weight: 2,
      }),
    ]);
    const merged = stakeholderWeightsProvider.merge(stakeholderWeights);
    expect(merged.getAll()).toHaveLength(4);
    expect(merged.getOrFail('A').weight).toEqual(2);
    expect(merged.getOrFail('B').weight).toEqual(0.5);
    expect(merged.getOrFail('C').weight).toEqual(1.5);
    expect(merged.getOrFail('E').weight).toEqual(2);
  });
});
