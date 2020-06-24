import { Workbook, Row, Cell, Worksheet } from 'exceljs';
import { Region } from '../entities/region';
export class RegionReader {

    constructor() {

    }
    public async read(path: string): Promise<Region[]> {
        // create object for workbook
        let wb: Workbook = new Workbook();
        wb = await wb.xlsx.readFile(path);
        let sheet: Worksheet = wb.getWorksheet("11.Region");

        let regions: Region[] = [];
        // cell object
        for (let row = 22; row <= 242; row++) {
            let cellCountryName: Cell = sheet.getCell(row, 2);
            let cellCountryCode: Cell = sheet.getCell(row, 10);
            let cellPPPIndex: Cell = sheet.getCell(row, 3);
            regions.push(new Region(cellPPPIndex.result as number, cellCountryCode.text, cellCountryName.text));
        }
        return regions;
    }
}