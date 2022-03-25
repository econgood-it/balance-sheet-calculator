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
      [6, 227],
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
      countryCode: 'AWO',
      countryName: 'World',
      pppIndex: 0.97803586258736475,
      ituc: 3.2380952380952381,
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

  it('should read region_5_0_5.csv', async () => {
    const regionReader = new RegionReader();
    const pathToCsv = path.join(
      path.resolve(__dirname, readerFolder),
      'regions_5_0_5.csv'
    );
    const regions: Region[] = await regionReader.read(
      pathToCsv,
      [22, 243],
      BalanceSheetVersion.v5_0_5
    );
    expect(regions).toContainEqual({
      countryCode: 'ABW',
      countryName: 'Aruba',
      pppIndex: 1.53937701809995,
      ituc: 3.52,
      validFromVersion: BalanceSheetVersion.v5_0_5,
    });
    expect(regions).toContainEqual({
      countryCode: 'ISL',
      countryName: 'Iceland',
      pppIndex: 1.09979988644301,
      ituc: 1,
      validFromVersion: BalanceSheetVersion.v5_0_5,
    });
    expect(regions).toContainEqual({
      countryCode: 'ZWE',
      countryName: 'Zimbabwe',
      pppIndex: 1.41117750678159,
      ituc: 5,
      validFromVersion: BalanceSheetVersion.v5_0_5,
    });
    // Check average regions
    expect(regions).toContainEqual({
      countryCode: 'AWO',
      countryName: 'World',
      pppIndex: 1.00304566871495,
      ituc: 3.23809523809524,
      validFromVersion: BalanceSheetVersion.v5_0_5,
    });
    expect(regions).toContainEqual({
      countryCode: 'AOC',
      countryName: 'Oceania',
      pppIndex: 1.49858687129258,
      ituc: 4.05,
      validFromVersion: BalanceSheetVersion.v5_0_5,
    });
    expect(regions).toContainEqual({
      countryCode: 'AAF',
      countryName: 'Africa',
      pppIndex: 2.51455039477944,
      ituc: 3.79,
      validFromVersion: BalanceSheetVersion.v5_0_5,
    });
    expect(regions).toContainEqual({
      countryCode: 'AAM',
      countryName: 'Americas',
      pppIndex: 1.17486233777459,
      ituc: 3.52,
      validFromVersion: BalanceSheetVersion.v5_0_5,
    });
    expect(regions).toContainEqual({
      countryCode: 'AAS',
      countryName: 'Asia',
      pppIndex: 2.57526049680317,
      ituc: 4.47,
      validFromVersion: BalanceSheetVersion.v5_0_5,
    });
    expect(regions).toContainEqual({
      countryCode: 'AEU',
      countryName: 'Europe',
      pppIndex: 1.03314026740667,
      ituc: 2.55,
      validFromVersion: BalanceSheetVersion.v5_0_5,
    });
  });
});
