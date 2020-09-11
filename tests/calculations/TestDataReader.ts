import { Workbook, Row, Cell, Worksheet } from 'exceljs';
import { Rating } from '../../src/entities/rating';
import { Topic } from '../../src/entities/topic';
import { PositiveAspect } from '../../src/entities/positiveAspect';
import { NegativeAspect } from '../../src/entities/negativeAspect';
export class TestDataReader {
    public async readRating(path: string, withDefaultValues: boolean): Promise<Rating> {
        // create object for workbook
        let wb: Workbook = new Workbook();
        const sheet: Worksheet = await wb.csv.readFile(path, { parserOptions: { delimiter: ',' } });
        //wb = await wb.xlsx.readFile(path);
        const topics: Topic[] = [];
        let rowIndex = 2;
        const typeIndex = 1;
        const shortNameIndex = 2;
        const nameIndex = 3;
        const weightIndex = 4;
        const estimationIndex = 5;
        const pointsIndex = 6;
        const maxPointsIndex = 7;
        const defaultPoints = 0;
        const defaultMaxPoints = 0;
        while (true) {
            let row: Row = sheet.getRow(rowIndex);
            const type = row.getCell(typeIndex).text;
            if (type == "") {
                return new Rating(undefined, topics);
            }
            if (type == "Topic") {
                topics.push(new Topic(undefined, row.getCell(shortNameIndex).text, row.getCell(nameIndex).text,
                    Number(row.getCell(estimationIndex).text), this.getVal(Number(row.getCell(pointsIndex).text), defaultPoints, withDefaultValues),
                    this.getVal(Number(row.getCell(maxPointsIndex).text), defaultMaxPoints, withDefaultValues),
                    Number(row.getCell(weightIndex).text), [], []));
            } else if (type == "PositiveAspect") {
                topics[topics.length - 1].positiveAspects.push(
                    new PositiveAspect(undefined, row.getCell(shortNameIndex).text, row.getCell(nameIndex).text,
                        Number(row.getCell(estimationIndex).text), this.getVal(Number(row.getCell(pointsIndex).text), defaultPoints, withDefaultValues),
                        this.getVal(Number(row.getCell(maxPointsIndex).text), defaultMaxPoints, withDefaultValues),
                        Number(row.getCell(weightIndex).text))
                );
            } else if (type == "NegativeAspect") {
                topics[topics.length - 1].negativeAspects.push(
                    new NegativeAspect(undefined, row.getCell(shortNameIndex).text, row.getCell(nameIndex).text,
                        Number(row.getCell(estimationIndex).text),
                        this.getVal(Number(row.getCell(pointsIndex).text), defaultPoints, withDefaultValues),
                        this.getVal(Number(row.getCell(maxPointsIndex).text), defaultMaxPoints, withDefaultValues))
                );
            }
            rowIndex += 1
        }

    }

    private getVal(val: number, defaultValue: number, withDefaultValues: boolean) {
        return withDefaultValues ? defaultValue : val;
    }
}