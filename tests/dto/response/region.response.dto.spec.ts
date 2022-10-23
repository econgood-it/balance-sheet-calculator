import { RegionResponseDTO } from '../../../src/dto/response/region.response.dto';
import { Region } from '../../../src/models/region';

describe('Region DTO', () => {
  it('should be created from region entity', () => {
    const region: Region = {
      pppIndex: 3.4,
      countryCode: 'DEU',
      countryName: 'Germany',
      ituc: 3,
    };

    const regionDTO = RegionResponseDTO.fromRegion(region);
    expect(regionDTO).toMatchObject({
      countryCode: 'DEU',
      countryName: 'Germany',
    });
  });
});
