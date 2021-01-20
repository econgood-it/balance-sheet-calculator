import * as path from 'path';
import { Workbook, Cell, Worksheet } from 'exceljs';
import {Industry} from "../entities/industry";

interface Headers {
    ecologicalDesignOfProductsAndServicesIndex: number;
    ecologicalSupplyChainRiskIndex: number;
    industryCodeIndex: number;
}

export class IndustryReader {

    private static readonly DEFAULT_HEADERS: Headers = {
        ecologicalDesignOfProductsAndServicesIndex: 9,
        ecologicalSupplyChainRiskIndex: 16,
        industryCodeIndex: 1,
    }

    public async read(headers: Headers = IndustryReader.DEFAULT_HEADERS): Promise<Industry[]> {
        const pathToCsv = path.join(path.resolve(__dirname, '../files/reader'), "industry.csv");
        // create object for workbook
        let wb: Workbook = new Workbook();
        const sheet: Worksheet = await wb.csv.readFile(pathToCsv, { parserOptions: { delimiter: ',' } });

        let industries: Industry[] = [];
        // cell object
        for (let row = 4; row <= 32; row++) {
            const cellIndustryCode: Cell = sheet.getCell(row, headers.industryCodeIndex);
            const cellEcologicalSupplyChainRisk: Cell = sheet.getCell(row, headers.ecologicalSupplyChainRiskIndex);
            const cellEcologicalDesignOfProductsAndServices: Cell = sheet.getCell(row,
              headers.ecologicalDesignOfProductsAndServicesIndex);

            industries.push(new Industry(undefined, this.mapTextToWeightValue(cellEcologicalSupplyChainRisk.text),
              this.mapTextToWeightValue(cellEcologicalDesignOfProductsAndServices.text),
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