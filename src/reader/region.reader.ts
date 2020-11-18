import * as path from 'path';
import { Workbook, Cell, Worksheet } from 'exceljs';
import { Region } from '../entities/region';

interface Headers {
    countryNameIndex: number;
    countryCodeIndex: number;
    pppIndexIndex: number
    itucIndex: number;
}

export class RegionReader {

    private static readonly DEFAULT_HEADERS: Headers = {
        countryNameIndex: 2,
        countryCodeIndex: 10,
        pppIndexIndex: 3,
        itucIndex: 6,
    }

    public async read(headers: Headers = RegionReader.DEFAULT_HEADERS): Promise<Region[]> {
        const pathToCsv = path.join(path.resolve(__dirname, '../files/reader'), "regions.csv");
        // create object for workbook
        let wb: Workbook = new Workbook();
        const sheet: Worksheet = await wb.csv.readFile(pathToCsv, { parserOptions: { delimiter: ',' } });
        //wb = await wb.xlsx.readFile(path);

        let regions: Region[] = [];
        // cell object
        for (let row = 6; row <= 226; row++) {
            let cellCountryName: Cell = sheet.getCell(row, headers.countryNameIndex);
            let cellCountryCode: Cell = sheet.getCell(row, headers.countryCodeIndex);
            let cellPPPIndex: Cell = sheet.getCell(row, headers.pppIndexIndex);
            let cellItuc: Cell = sheet.getCell(row, headers.itucIndex);
            regions.push(new Region(undefined, Number(cellPPPIndex.text), cellCountryCode.text, cellCountryName.text,
              Number(cellItuc.text)));
        }
        return regions;
    }
}