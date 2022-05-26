import { Industry } from '../../../src/entities/industry';
import { IndustryResponseDTO } from '../../../src/dto/response/industry.response.dto';

describe('Industry DTO', () => {
  it('should be created from industry entity', () => {
    const industry = new Industry(undefined, 'A', 'Agriculture', 3, 4);
    const industryDTO = IndustryResponseDTO.fromIndustry(industry, 'en');
    expect(industryDTO).toMatchObject({
      industryCode: 'A',
      industryName: 'Agriculture',
    });
  });
});
