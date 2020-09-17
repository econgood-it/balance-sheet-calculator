import { Workbook, Row, Cell, Worksheet } from 'exceljs';
import { Rating } from '../../src/entities/rating';
import { Topic } from '../../src/entities/topic';
import { Aspect } from '../../src/entities/aspect';

interface Headers {
    shortNameIndex: number;
    nameIndex: number;
    weightIndex: number;
    estimationIndex: number;
    weightExpIndex: number
    pointsExpIndex: number;
    maxPointsExpIndex: number;
}

export class TestRatingReader {

    private static readonly DEFAULT_HEADERS: Headers = {
        shortNameIndex: 1,
        nameIndex: 2,
        weightIndex: 3,
        estimationIndex: 4,
        weightExpIndex: 5,
        pointsExpIndex: 6,
        maxPointsExpIndex: 7
    }

    public async readRatingExpected(path: string, headers: Headers = TestRatingReader.DEFAULT_HEADERS): Promise<Rating> {
        return this.readRating(path, headers, false);
    }

    public async readRatingInput(path: string, headers: Headers = TestRatingReader.DEFAULT_HEADERS): Promise<Rating> {
        return this.readRating(path, headers, true);
    }

    private async readRating(path: string, headers: Headers, asInput: boolean): Promise<Rating> {
        // create object for workbook
        let wb: Workbook = new Workbook();
        const sheet: Worksheet = await wb.csv.readFile(path, { parserOptions: { delimiter: ',' } });
        //wb = await wb.xlsx.readFile(path);
        const topics: Topic[] = [];
        let rowIndex = 2;
        while (true) {
            let row: Row = sheet.getRow(rowIndex);
            const shortName = row.getCell(headers.shortNameIndex).text;
            if (shortName == "") {
                return new Rating(undefined, topics);
            }
            if (shortName.length == 2) {
                topics.push(this.readTopic(row, headers, asInput));
            } else if (shortName.length > 2) {
                topics[topics.length - 1].aspects.push(this.readAspect(row, headers, asInput));
            }
            rowIndex += 1
        }
    }

    private readTopic(row: Row, headers: Headers, asInput: boolean): Topic {
        const shortName = row.getCell(headers.shortNameIndex).text;
        const name = row.getCell(headers.nameIndex).text;
        const estimations = Number(row.getCell(headers.estimationIndex).text);
        const defaultPoints = 0;
        const defaultMaxPoints = 0;
        const weightAsStr = row.getCell(headers.weightIndex).text;
        const isWeightSelectedByUser = weightAsStr != "" ? true : false;
        if (asInput) {
            const weight = isWeightSelectedByUser ? Number(weightAsStr) : 1;
            return new Topic(undefined, shortName, name, estimations,
                defaultPoints, defaultMaxPoints, weight, isWeightSelectedByUser, []);
        } else {
            return new Topic(undefined, shortName, name, estimations,
                Number(row.getCell(headers.pointsExpIndex).text),
                Number(row.getCell(headers.maxPointsExpIndex).text),
                Number(row.getCell(headers.weightExpIndex).text),
                isWeightSelectedByUser, []);
        }
    }

    private readAspect(row: Row, headers: Headers, asInput: boolean): Aspect {
        const shortName = row.getCell(headers.shortNameIndex).text;
        const name = row.getCell(headers.nameIndex).text;
        const estimations = Number(row.getCell(headers.estimationIndex).text);
        const isPositive = !name.startsWith('Negative');
        const defaultPoints = 0;
        const defaultMaxPoints = 0;
        const weightAsStr = row.getCell(headers.weightIndex).text;
        const isWeightSelectedByUser = weightAsStr != "" ? true : false;
        if (asInput) {
            let weight = 1
            if (isPositive) {
                weight = isWeightSelectedByUser ? Number(weightAsStr) : weight;
            }
            return new Aspect(undefined, shortName, name,
                estimations, defaultPoints, defaultMaxPoints,
                weight, isWeightSelectedByUser, isPositive);
        } else {
            return new Aspect(undefined, shortName, name, estimations,
                Number(row.getCell(headers.pointsExpIndex).text),
                Number(row.getCell(headers.maxPointsExpIndex).text),
                Number(row.getCell(headers.weightExpIndex).text), isWeightSelectedByUser, isPositive);
        }
    }
}