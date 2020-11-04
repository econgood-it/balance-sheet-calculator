import * as path from 'path';
import { Workbook, Row, Cell, Worksheet } from 'exceljs';
import { Region } from '../entities/region';
export class RegionReader {

    constructor() {

    }

    public async read(): Promise<Region[]> {
        const pathToCsv = path.join(path.resolve(__dirname, '../files/reader'), "regions.csv");
        // create object for workbook
        let wb: Workbook = new Workbook();
        const sheet: Worksheet = await wb.csv.readFile(pathToCsv, { parserOptions: { delimiter: ',' } });
        //wb = await wb.xlsx.readFile(path);

        let regions: Region[] = [];
        // cell object
        for (let row = 6; row <= 226; row++) {
            let cellCountryName: Cell = sheet.getCell(row, 2);
            let cellCountryCode: Cell = sheet.getCell(row, 10);
            let cellPPPIndex: Cell = sheet.getCell(row, 3);
            regions.push(new Region(undefined, Number(cellPPPIndex.text), cellCountryCode.text, cellCountryName.text));
        }
        return regions;
    }
}