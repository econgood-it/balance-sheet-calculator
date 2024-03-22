import { StakeholderWeightsProvider } from '../../src/providers/stakeholder.weights.provider';
import { OldStakeholderWeight } from '../../src/models/oldStakeholderWeight';

describe('StakeholderWeightsProvider', () => {
  it('should merge with empty stakeholder weights', () => {
    const stakeholderWeights: OldStakeholderWeight[] = [];
    const stakeholderWeightsProvider = new StakeholderWeightsProvider([
      ['A', 1],
      ['B', 0.5],
      ['E', 2],
    ]);
    const merged = stakeholderWeightsProvider.merge(stakeholderWeights);
    expect([...merged.entries()]).toHaveLength(3);
    expect(merged.getOrFail('A')).toEqual(1);
    expect(merged.getOrFail('B')).toEqual(0.5);
    expect(merged.getOrFail('E')).toEqual(2);
  });

  it('should merge with stakeholder weights', () => {
    const stakeholderWeights = [
      { shortName: 'A', weight: 2 },
      { shortName: 'C', weight: 1.5 },
    ];
    const stakeholderWeightsProvider = new StakeholderWeightsProvider([
      ['A', 1],
      ['B', 0.5],
      ['E', 2],
    ]);
    const merged = stakeholderWeightsProvider.merge(stakeholderWeights);
    expect([...merged.entries()]).toHaveLength(4);
    expect(merged.getOrFail('A')).toEqual(2);
    expect(merged.getOrFail('B')).toEqual(0.5);
    expect(merged.getOrFail('C')).toEqual(1.5);
    expect(merged.getOrFail('E')).toEqual(2);
  });
});
