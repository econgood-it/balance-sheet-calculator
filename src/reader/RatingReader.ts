import { Workbook, Row, Cell, Worksheet } from 'exceljs';
import { Rating } from '../entities/rating';
import { Topic } from '../entities/topic';
import { Aspect } from '../entities/aspect';
import { AspectDTOCreate } from '../dto/create/aspectCreate.dto';
import { RatingDTOCreate } from '../dto/create/ratingCreate.dto';
import { TopicDTOCreate } from '../dto/create/topicCreate.dto';

interface Headers {
    shortNameIndex: number;
    nameIndex: number;
    weightIndex: number;
    estimationIndex: number;
    pointsIndex: number;
    maxPointsIndex: number;
    isWeightSelectedByUserIndex: number;
}


enum RatingFormat {
    Rating = "Rating",
    RatingDTOCreate = "RatingDTOCreate"
}



export class RatingReader {

    private static readonly DEFAULT_HEADERS: Headers = {
        shortNameIndex: 1,
        nameIndex: 2,
        weightIndex: 3,
        isWeightSelectedByUserIndex: 4,
        estimationIndex: 5,
        pointsIndex: 6,
        maxPointsIndex: 7,
    }

    public async readRatingDTOFromCsv(path: string, headers: Headers = RatingReader.DEFAULT_HEADERS): Promise<RatingDTOCreate> {
        // create object for workbook
        const rating: Rating = await this.readRatingFromCsv(path, headers);
        const topics: TopicDTOCreate[] = [];
        for (const topic of rating.topics) {
            const aspects: AspectDTOCreate[] = [];
            for (const aspect of topic.aspects) {
                aspects.push(new AspectDTOCreate(aspect.shortName, aspect.name, aspect.estimations,
                    aspect.weight, aspect.isWeightSelectedByUser,
                    aspect.isPositive));
            }
            topics.push(new TopicDTOCreate(topic.shortName, topic.name, topic.estimations,
                topic.weight, topic.isWeightSelectedByUser,
                aspects));
        }
        return new RatingDTOCreate(topics);
    }

    public async readRatingFromCsv(path: string, headers: Headers = RatingReader.DEFAULT_HEADERS): Promise<Rating> {
        let wb: Workbook = new Workbook();
        const sheet: Worksheet = await wb.csv.readFile(path, { parserOptions: { delimiter: ',' } });

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
        const isWeightSelectedByUser = row.getCell(headers.isWeightSelectedByUserIndex).text.toLowerCase() == 'true' ?
            true : false;
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
        const isWeightSelectedByUser = row.getCell(headers.isWeightSelectedByUserIndex).text.toLowerCase() == 'true' ?
            true : false;
        return new Aspect(undefined, shortName, name, estimations,
            Number(row.getCell(headers.pointsIndex).text),
            Number(row.getCell(headers.maxPointsIndex).text),
            Number(weightAsStr), isWeightSelectedByUser, isPositive);
    }
}