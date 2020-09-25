import { Workbook, Row, Cell, Worksheet } from 'exceljs';
import { Rating } from '../entities/rating';
import { Topic } from '../entities/topic';
import { Aspect } from '../entities/aspect';

interface Headers {
    shortNameIndex: number;
    nameIndex: number;
    weightIndex: number;
    estimationIndex: number;
    pointsIndex: number;
    maxPointsIndex: number;
}

export class RatingReader {

    private static readonly DEFAULT_HEADERS: Headers = {
        shortNameIndex: 1,
        nameIndex: 2,
        weightIndex: 3,
        estimationIndex: 4,
        pointsIndex: 5,
        maxPointsIndex: 6
    }

    public async readRatingFromCsv(path: string, headers: Headers = RatingReader.DEFAULT_HEADERS): Promise<Rating> {
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
                topics.push(this.readTopic(row, headers));
            } else if (shortName.length > 2) {
                topics[topics.length - 1].aspects.push(this.readAspect(row, headers));
            }
            rowIndex += 1
        }
    }

    private readTopic(row: Row, headers: Headers): Topic {
        const shortName = row.getCell(headers.shortNameIndex).text;
        const name = row.getCell(headers.nameIndex).text;
        const estimations = Number(row.getCell(headers.estimationIndex).text);
        const weightAsStr = row.getCell(headers.weightIndex).text;
        const isWeightSelectedByUser = weightAsStr != "" ? true : false;
        return new Topic(undefined, shortName, name, estimations,
            Number(row.getCell(headers.pointsIndex).text),
            Number(row.getCell(headers.maxPointsIndex).text),
            Number(weightAsStr),
            isWeightSelectedByUser, []);
    }

    private readAspect(row: Row, headers: Headers): Aspect {
        const shortName = row.getCell(headers.shortNameIndex).text;
        const name = row.getCell(headers.nameIndex).text;
        const estimations = Number(row.getCell(headers.estimationIndex).text);
        const isPositive = !name.startsWith('Negative');
        const weightAsStr = row.getCell(headers.weightIndex).text;
        const isWeightSelectedByUser = weightAsStr != "" ? true : false;
        return new Aspect(undefined, shortName, name, estimations,
            Number(row.getCell(headers.pointsIndex).text),
            Number(row.getCell(headers.maxPointsIndex).text),
            Number(weightAsStr), isWeightSelectedByUser, isPositive);
    }
}