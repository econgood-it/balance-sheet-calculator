import { StakeholderWeightSchema } from '../../src/models/stakeholder.weight';

describe('StakeholderWeight', () => {
  it('should be parsed from object', () => {
    const jsObject = { shortName: 'A', weight: 0.5 };
    const stakeholderWeight = StakeholderWeightSchema.parse(jsObject);
    expect(stakeholderWeight).toEqual(jsObject);
  });
});
