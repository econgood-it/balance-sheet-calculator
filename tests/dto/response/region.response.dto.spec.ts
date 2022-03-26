import { Region } from '../../../src/entities/region';
import { BalanceSheetVersion } from '../../../src/entities/enums';
import { RegionResponseDTO } from '../../../src/dto/response/region.response.dto';

describe('Region DTO', () => {
  it('should be created from region entity', () => {
    const region = new Region(
      undefined,
      3.4,
      'DEU',
      'Germany',
      3,
      BalanceSheetVersion.v5_0_6
    );
    const regionDTO = RegionResponseDTO.fromRegion(region, 'en');
    expect(regionDTO).toMatchObject({
      countryCode: 'DEU',
      countryName: 'Germany',
    });
  });
});
