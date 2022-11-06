import { Region } from '../../src/models/region';
import { RegionResponseBodySchema } from '../../src/dto/region.dto';

describe('Region DTO', () => {
  it('should be created from region entity', () => {
    const region: Region = {
      pppIndex: 3.4,
      countryCode: 'DEU',
      countryName: 'Germany',
      ituc: 3,
    };

    const regionDTO = RegionResponseBodySchema.parse(region);
    expect(regionDTO).toMatchObject({
      countryCode: 'DEU',
      countryName: 'Germany',
    });
  });
});
