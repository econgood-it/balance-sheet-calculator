import { RegionReader } from '../../src/reader/region.reader';
import { Region } from '../../src/entities/region';
import path from 'path';
describe('Region reader', () => {
  const readerFolder = '../../src/files/reader';
  it.only('should read region.csv', async () => {
    const regionReader = new RegionReader();
    const pathToCsv = path.join(
      path.resolve(__dirname, readerFolder),
      'regions.csv'
    );
    const regions: Region[] = await regionReader.read(pathToCsv);
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

  it('should read region_5_0_6.csv', async () => {
    const regionReader = new RegionReader();
    const pathToCsv = path.join(
      path.resolve(__dirname, readerFolder),
      'regions_5_0_6.csv'
    );
    const regions: Region[] = await regionReader.read(pathToCsv);
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
