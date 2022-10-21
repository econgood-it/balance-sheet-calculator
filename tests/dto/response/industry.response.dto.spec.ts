import { IndustryResponseDTO } from '../../../src/dto/response/industry.response.dto';
import { Industry } from '../../../src/models/industry';

describe('Industry DTO', () => {
  it('should be created from industry entity', () => {
    const industry: Industry = {
      industryCode: 'A',
      name: 'Agriculture',
      ecologicalDesignOfProductsAndServices: 3,
      ecologicalSupplyChainRisk: 4,
    };
    const industryDTO = IndustryResponseDTO.fromIndustry(industry);
    expect(industryDTO).toMatchObject({
      industryCode: 'A',
      industryName: 'Agriculture',
    });
  });
});
