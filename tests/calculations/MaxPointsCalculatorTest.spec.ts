
import { MaxPointsCalculator } from "../../src/calculations/MaxPointsCalculator";
import { Topic } from "../../src/entities/topic";
import { CompanyFacts } from "../../src/entities/companyFacts";
import { Connection, Repository } from "typeorm";
import { Region } from "../../src/entities/region";
import { DatabaseConnectionCreator } from '../../src/DatabaseConnectionCreator';
import { ConfigurationReader } from "../../src/configurationReader";
import { BalanceSheetType } from "../../src/entities/enums";
import { Assertions } from "../Assertions";
import * as path from 'path';
import { RatingReader } from "../../src/reader/rating.reader";
import { CompanyFacts0, CompanyFacts1 } from "../testData/companyFacts";
import {Precalculations, Precalculator} from "../../src/calculations/precalculator";

describe('Max points calculator', () => {
    let connection: Connection;
    let regionRepository: Repository<Region>;

    beforeAll(async (done) => {
        connection = await DatabaseConnectionCreator.createConnectionAndRunMigrations(ConfigurationReader.read());
        regionRepository = connection.getRepository(Region)
        done();
    });

    afterAll(async (done) => {
        await connection.close();
        done();
    })

    async function testCalculation(fileNameOfRatingInputData: string, fileNameOfRatingExpectedData: string,
        companyFacts: CompanyFacts, done: any) {
        const testDataReader = new RatingReader();
        const testDataDir = path.resolve(__dirname, '../testData');
        let pathToCsv = path.join(testDataDir, fileNameOfRatingInputData);
        const topics: Topic[] = (await testDataReader.readRatingFromCsv(pathToCsv)).topics;
        //console.log(topics);
        const precalculations: Precalculations = await new Precalculator(regionRepository).calculate(
          companyFacts);
        const maxPointsCalculator: MaxPointsCalculator = new MaxPointsCalculator();
        await maxPointsCalculator.updateMaxPointsAndPoints(topics, precalculations);
        pathToCsv = path.join(testDataDir, fileNameOfRatingExpectedData);
        const expected: Topic[] = (await testDataReader.readRatingFromCsv(pathToCsv)).topics;
        Assertions.assertTopics(topics, expected);
        done();
    }

    it('should calculate rating when the company facts values and the rating values are empty', async (done) =>
        testCalculation('fullRating01Input.csv', 'fullRating0Expected.csv', CompanyFacts0, done)
    )

    it('should calculate rating when the company facts values filled out but estimations, and weights are not set', async (done) =>
        testCalculation('fullRating01Input.csv', 'fullRating1Expected.csv', CompanyFacts1, done)
    )

    it('should calculate rating when the company facts values and rating values filled out', async (done) =>
        testCalculation('fullRating2Input.csv', 'fullRating2Expected.csv', CompanyFacts1, done)
    )
})
