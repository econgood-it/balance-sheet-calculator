import { Workbook, Cell, Worksheet } from 'exceljs';
import { DEFAULT_COUNTRY_CODE, Region } from '../entities/region';
import { BalanceSheetVersion } from '../entities/enums';

interface Headers {
  countryNameIndex: number;
  countryCodeIndex: number;
  pppIndexIndex: number;
  itucIndex: number;
}

export class RegionReader {
  private static readonly DEFAULT_HEADERS: Headers = {
    countryNameIndex: 2,
    countryCodeIndex: 10,
    pppIndexIndex: 3,
    itucIndex: 6,
  };

  public async read(
    pathToCsv: string,
    rowRangeContainingRegions: number[],
    validFromVersion: BalanceSheetVersion,
    headers: Headers = RegionReader.DEFAULT_HEADERS
  ): Promise<Region[]> {
    // create object for workbook
    const wb: Workbook = new Workbook();
    const sheet: Worksheet = await wb.csv.readFile(pathToCsv, {
      parserOptions: { delimiter: ',' },
    });
    // wb = await wb.xlsx.readFile(path);
    const regions: Region[] = [];
    // cell object
    for (
      let row = rowRangeContainingRegions[0];
      row <= rowRangeContainingRegions[1];
      row++
    ) {
      const cellCountryName: Cell = sheet.getCell(
        row,
        headers.countryNameIndex
      );
      const cellCountryCode: Cell = sheet.getCell(
        row,
        headers.countryCodeIndex
      );
      const cellPPPIndex: Cell = sheet.getCell(row, headers.pppIndexIndex);
      const cellItuc: Cell = sheet.getCell(row, headers.itucIndex);
      if (cellCountryCode.text === 'World') {
        regions.push(
          new Region(
            undefined,
            Number(cellPPPIndex.text),
            DEFAULT_COUNTRY_CODE,
            'World',
            Number(cellItuc.text),
            validFromVersion
          )
        );
      } else {
        regions.push(
          new Region(
            undefined,
            Number(cellPPPIndex.text),
            cellCountryCode.text,
            cellCountryName.text,
            Number(cellItuc.text),
            validFromVersion
          )
        );
      }
    }
    return regions;
  }
}
