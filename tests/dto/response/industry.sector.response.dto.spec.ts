import { IndustrySectorDtoResponse } from '../../../src/dto/response/industry.sector.response.dto';
import { IndustrySector } from '../../../src/models/company.facts';

describe('IndustrySectorResponseDTO', () => {
  it('is created from industry sector', () => {
    const industrySector: IndustrySector = {
      industryCode: 'A',
      amountOfTotalTurnover: 1,
      description: 'desc',
    };
    const industrySectorDtoResponse =
      IndustrySectorDtoResponse.fromIndustrySector(industrySector);
    expect(industrySectorDtoResponse).toBeDefined();
    expect(industrySectorDtoResponse).toMatchObject({
      industryCode: 'A',
      amountOfTotalTurnover: 1,
      description: 'desc',
    });
  });
});
