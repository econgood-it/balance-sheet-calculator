import { RegionReader } from '../../src/reader/region.reader';
import { Region } from '../../src/entities/region';
import path from 'path';
import { BalanceSheetVersion } from '../../src/entities/enums';

describe('Region reader', () => {
  const readerFolder = '../../src/files/reader';
  it('should read region.csv', async () => {
    const regionReader = new RegionReader();
    const pathToCsv = path.join(
      path.resolve(__dirname, readerFolder),
      'regions_5_0_4.csv'
    );
    const regions: Region[] = await regionReader.read(
      pathToCsv,
      [6, 226],
      BalanceSheetVersion.v5_0_4
    );
    expect(regions).toContainEqual({
      countryCode: 'ABW',
      countryName: 'Aruba',
      pppIndex: 1.9628994497935313,
      ituc: 3.4210526315789473,
      validFromVersion: BalanceSheetVersion.v5_0_4,
    });
    expect(regions).toContainEqual({
      countryCode: 'ISL',
      countryName: 'Iceland',
      pppIndex: 0.8592191515177231,
      ituc: 1,
      validFromVersion: BalanceSheetVersion.v5_0_4,
    });
    expect(regions).toContainEqual({
      countryCode: 'ZWE',
      countryName: 'Zimbabwe',
      pppIndex: 3.0325616327831186,
      ituc: 5,
      validFromVersion: BalanceSheetVersion.v5_0_4,
    });
  });

  it('should read region_5_0_6.csv', async () => {
    const regionReader = new RegionReader();
    const pathToCsv = path.join(
      path.resolve(__dirname, readerFolder),
      'regions_5_0_6.csv'
    );
    const regions: Region[] = await regionReader.read(
      pathToCsv,
      [22, 242],
      BalanceSheetVersion.v5_0_4
    );
    expect(regions).toContainEqual({
      countryCode: 'ABW',
      countryName: 'Aruba',
      pppIndex: 1.53937701809995,
      ituc: 3.52,
      validFromVersion: BalanceSheetVersion.v5_0_4,
    });
    expect(regions).toContainEqual({
      countryCode: 'ISL',
      countryName: 'Iceland',
      pppIndex: 1.09979988644301,
      ituc: 1,
      validFromVersion: BalanceSheetVersion.v5_0_4,
    });
    expect(regions).toContainEqual({
      countryCode: 'ZWE',
      countryName: 'Zimbabwe',
      pppIndex: 1.41117750678159,
      ituc: 5,
      validFromVersion: BalanceSheetVersion.v5_0_4,
    });
  });
});
