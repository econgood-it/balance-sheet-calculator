import { RegionReader } from '../../src/reader/region.reader';
import { Region } from '../../src/entities/region';
describe('Region reader', () => {
  it('should read region.csv', async () => {
    const regionReader = new RegionReader();
    const regions: Region[] = await regionReader.read();
    expect(regions).toContainEqual({
      countryCode: 'ABW',
      countryName: 'Aruba',
      pppIndex: 1.9628994497935313,
      ituc: 3.4210526315789473,
    });
    expect(regions).toContainEqual({
      countryCode: 'ISL',
      countryName: 'Iceland',
      pppIndex: 0.8592191515177231,
      ituc: 1,
    });
    expect(regions).toContainEqual({
      countryCode: 'ZWE',
      countryName: 'Zimbabwe',
      pppIndex: 3.0325616327831186,
      ituc: 5,
    });
  });
});
