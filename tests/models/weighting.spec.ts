import { makeWeighting } from '../../src/models/weighting';

describe('Weighting', () => {
  it('should be created', () => {
    const weighting = makeWeighting({
      shortName: 'A',
      weight: 0.5,
    });
    expect(weighting).toMatchObject({
      shortName: 'A',
      weight: 0.5,
    });
  });
});
