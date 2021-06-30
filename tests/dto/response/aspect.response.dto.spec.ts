import { Aspect } from '../../../src/entities/aspect';
import { AspectDTOResponse } from '../../../src/dto/response/aspect.response.dto';

jest.mock('../../../src/i18n', () => ({
  init: () => {},
  use: () => {},
  t: (k: string) => 'Menschenwürde in der Zulieferkette',
}));

describe('AspectResponseDTO', () => {
  it('is created from topic', async () => {
    const aspect = new Aspect(
      undefined,
      'A1.1',
      'v5:compact.A1',
      2,
      3,
      51,
      5,
      true,
      true
    );
    const aspectResponseDTO = AspectDTOResponse.fromAspect(aspect, 'de');
    expect(aspectResponseDTO).toBeDefined();
    expect(aspectResponseDTO).toMatchObject({
      shortName: 'A1.1',
      name: 'Menschenwürde in der Zulieferkette',
      estimations: 2,
      points: 3,
      maxPoints: 51,
      weight: 5,
      isWeightSelectedByUser: true,
      isPositive: true,
    });
  });
});
