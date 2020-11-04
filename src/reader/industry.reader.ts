import * as path from 'path';
import { Workbook, Cell, Worksheet } from 'exceljs';
import {Industry} from "../entities/industry";

export class IndustryReader {

    public async read(): Promise<Industry[]> {
        const pathToCsv = path.join(path.resolve(__dirname, '../files/reader'), "industry.csv");
        // create object for workbook
        let wb: Workbook = new Workbook();
        const sheet: Worksheet = await wb.csv.readFile(pathToCsv, { parserOptions: { delimiter: ',' } });

        let industries: Industry[] = [];
        // cell object
        for (let row = 4; row <= 32; row++) {
            const cellIndustryCode: Cell = sheet.getCell(row, 1);
            const cellEcologicalSupplyChainRisk: Cell = sheet.getCell(row, 16);
            industries.push(new Industry(undefined, this.mapTextToWeightValue(cellEcologicalSupplyChainRisk.text),
              cellIndustryCode.text.trim()));
        }
        return industries;
    }

    private mapTextToWeightValue(text: string): number {
        let weight = 1;
        switch (text) {
            case 'trifft nicht zu':
                weight = 0
                break;
            case 'niedrig':
                weight = 0.5
                break;
            case 'mittel':
                weight = 1;
                break;
            case 'hoch':
                weight = 1.5;
                break;
            case 'sehr hoch':
                weight = 2;
                break;
            default:
                weight = 1;
                break;
        }
        return weight;
    }
}