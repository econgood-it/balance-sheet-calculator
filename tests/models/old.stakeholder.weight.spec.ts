import { StakeholderWeightSchema } from '../../src/models/oldStakeholderWeight';

describe('StakeholderWeight', () => {
  it('should be parsed from object', () => {
    const jsObject = { shortName: 'A', weight: 0.5 };
    const stakeholderWeight = StakeholderWeightSchema.parse(jsObject);
    expect(stakeholderWeight).toEqual(jsObject);
  });
});
