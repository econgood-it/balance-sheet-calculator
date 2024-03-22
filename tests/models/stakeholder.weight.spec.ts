import { makeStakeholderWeight } from '../../src/models/stakeholder.weight';

describe('StakeholderWeight', () => {
  it('should be created', () => {
    const stakeholderWeight = makeStakeholderWeight({
      shortName: 'A',
      weight: 0.5,
    });
    expect(stakeholderWeight).toMatchObject({
      shortName: 'A',
      weight: 0.5,
    });
  });
});
