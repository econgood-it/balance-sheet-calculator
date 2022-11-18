import { Industry } from '../../src/models/industry';
import { industryToResponse } from '../../src/dto/industry.dto';

describe('Industry DTO', () => {
  it('should be created from industry entity', () => {
    const industry: Industry = {
      industryCode: 'A',
      name: 'Agriculture',
      ecologicalDesignOfProductsAndServices: 3,
      ecologicalSupplyChainRisk: 4,
    };
    const industryDTO = industryToResponse(industry);
    expect(industryDTO).toMatchObject({
      industryCode: 'A',
      industryName: 'Agriculture',
    });
  });
});
