
import { MaxPointsCalculator } from "../../src/calculations/MaxPointsCalculator";
import { Topic } from "../../src/entities/topic";
import { CompanyFacts } from "../../src/entities/companyFacts";
import { SupplyFraction } from "../../src/entities/supplyFraction";
import { EmployeesFraction } from "../../src/entities/employeesFraction";
import { Connection, Repository } from "typeorm";
import { Region } from "../../src/entities/region";
import { DatabaseConnectionCreator } from '../../src/DatabaseConnectionCreator';
import { ConfigurationReader } from "../../src/configurationReader";
import { BalanceSheetType } from "../../src/entities/enums";
import { PositiveAspect } from "../../src/entities/positiveAspect";
import { Assertions } from "./Assertions";
import { RatingDefault, CompanyFactsDefault } from "../data/full.default";
import * as path from 'path';
import { TestDataReader } from "./TestDataReader";
import { CompanyFacts1 } from "./testData/fullCompanyFacts1";

describe('Max points calculator', () => {
    let connection: Connection;
    let regionRepository: Repository<Region>;

    const arabEmiratesCode = "ARE";
    const afghanistanCode = "AFG";

    beforeAll(async (done) => {
        connection = await DatabaseConnectionCreator.createConnectionAndRunMigrations(ConfigurationReader.read());
        regionRepository = connection.getRepository(Region)
        done();
    });

    afterAll(async (done) => {
        await connection.close();
        done();
    })

    it('should calculate max points of topics', async (done) => {
        const supplyFractions: SupplyFraction[] = [new SupplyFraction(undefined, arabEmiratesCode, 300), new SupplyFraction(undefined, afghanistanCode, 20)];
        const employeesFractions: EmployeesFraction[] = [new EmployeesFraction(undefined, arabEmiratesCode, 0.3), new EmployeesFraction(undefined, afghanistanCode, 1)];
        const companyFacts: CompanyFacts = new CompanyFacts(undefined, 0, 2345, 238, 473, 342, 234, supplyFractions, employeesFractions);
        const topics: Topic[] = [
            new Topic(undefined, "A1", "A1 name", 0, 0, 51, 1, [], []),
            new Topic(undefined, "A2", "A2 name", 4, 0, 51, 1, [], []),
            new Topic(undefined, "A3", "A3 name", 6, 0, 51, 1, [], []),
            new Topic(undefined, "A4", "A4 name", 10, 0, 51, 1, [], []),
            new Topic(undefined, "B1", "B1 name", 0, 0, 51, 1, [], []),
            new Topic(undefined, "B2", "B2 name", 4, 0, 51, 1, [], []),
            new Topic(undefined, "B3", "B3 name", 6, 0, 51, 1, [], []),
            new Topic(undefined, "B4", "B4 name", 10, 0, 51, 1, [], []),
            new Topic(undefined, "C1", "C1 name", 0, 0, 51, 1, [], []),
            new Topic(undefined, "C2", "C2 name", 4, 0, 51, 1, [], []),
            new Topic(undefined, "C3", "C3 name", 6, 0, 51, 1, [], []),
            new Topic(undefined, "C4", "C4 name", 10, 0, 51, 1, [], []),
            new Topic(undefined, "D1", "D1 name", 0, 0, 51, 1, [], []),
            new Topic(undefined, "D2", "D2 name", 4, 0, 51, 1, [], []),
            new Topic(undefined, "D3", "D3 name", 6, 0, 51, 1, [], []),
            new Topic(undefined, "D4", "D4 name", 10, 0, 51, 1, [], []),
            new Topic(undefined, "E1", "E1 name", 0, 0, 51, 1, [], []),
            new Topic(undefined, "E2", "E2 name", 4, 0, 51, 1, [], []),
            new Topic(undefined, "E3", "E3 name", 6, 0, 51, 1, [], []),
            new Topic(undefined, "E4", "E4 name", 10, 0, 51, 1, [], []),
        ]
        const maxPointsCalculator: MaxPointsCalculator = new MaxPointsCalculator(companyFacts, regionRepository);
        await maxPointsCalculator.updateMaxPointsAndPoints(topics, BalanceSheetType.Compact);
        const maxPointsA = 22.727272727272727;
        const maxPointsBDE = 45.45454545454545;
        const maxPointsC = 90.9090909090909;
        const expected: Topic[] = [
            new Topic(undefined, "A1", "A1 name", 0, 0, maxPointsA, 1, [], []),
            new Topic(undefined, "A2", "A2 name", 4, 9.09090909090909, maxPointsA, 1, [], []),
            new Topic(undefined, "A3", "A3 name", 6, 13.636363636363637, maxPointsA, 1, [], []),
            new Topic(undefined, "A4", "A4 name", 10, maxPointsA, maxPointsA, 1, [], []),
            new Topic(undefined, "B1", "B1 name", 0, 0, maxPointsBDE, 1, [], []),
            new Topic(undefined, "B2", "B2 name", 4, 18.18181818181818, maxPointsBDE, 1, [], []),
            new Topic(undefined, "B3", "B3 name", 6, 27.272727272727273, maxPointsBDE, 1, [], []),
            new Topic(undefined, "B4", "B4 name", 10, maxPointsBDE, maxPointsBDE, 1, [], []),
            new Topic(undefined, "C1", "C1 name", 0, 0, maxPointsC, 1, [], []),
            new Topic(undefined, "C2", "C2 name", 4, 36.36363636363636, maxPointsC, 1, [], []),
            new Topic(undefined, "C3", "C3 name", 6, 54.54545454545455, maxPointsC, 1, [], []),
            new Topic(undefined, "C4", "C4 name", 10, maxPointsC, maxPointsC, 1, [], []),
            new Topic(undefined, "D1", "D1 name", 0, 0, maxPointsBDE, 1, [], []),
            new Topic(undefined, "D2", "D2 name", 4, 18.18181818181818, maxPointsBDE, 1, [], []),
            new Topic(undefined, "D3", "D3 name", 6, 27.272727272727273, maxPointsBDE, 1, [], []),
            new Topic(undefined, "D4", "D4 name", 10, maxPointsBDE, maxPointsBDE, 1, [], []),
            new Topic(undefined, "E1", "E1 name", 0, 0, maxPointsBDE, 1, [], []),
            new Topic(undefined, "E2", "E2 name", 4, 18.18181818181818, maxPointsBDE, 1, [], []),
            new Topic(undefined, "E3", "E3 name", 6, 27.272727272727273, maxPointsBDE, 1, [], []),
            new Topic(undefined, "E4", "E4 name", 10, maxPointsBDE, maxPointsBDE, 1, [], []),
        ]
        Assertions.assertTopics(topics, expected);
        done();
    })

    it('should calculate rating when the company facts values are empty or zero', async (done) => {
        const supplyFractions: SupplyFraction[] = [new SupplyFraction(undefined, arabEmiratesCode, 300), new SupplyFraction(undefined, afghanistanCode, 20)];
        const employeesFractions: EmployeesFraction[] = [new EmployeesFraction(undefined, arabEmiratesCode, 0.3), new EmployeesFraction(undefined, afghanistanCode, 1)];
        const companyFacts: CompanyFacts = new CompanyFacts(undefined, 0, 0, 0, 0, 0, 0, [], []);
        const topics: Topic[] = RatingDefault.topics;
        const maxPointsCalculator: MaxPointsCalculator = new MaxPointsCalculator(companyFacts, regionRepository);
        await maxPointsCalculator.updateMaxPointsAndPoints(topics, BalanceSheetType.Full);
        const expected: Topic[] = RatingDefault.topics;
        Assertions.assertTopics(topics, expected);
        done();
    })

    it('should calculate rating when the company facts values filled out but estimations, and weights are not set', async (done) => {
        const companyFacts: CompanyFacts = CompanyFacts1;
        const testDataReader = new TestDataReader();
        const pathToCsv = path.join(__dirname, 'testData', "fullRating1.csv");
        const topics: Topic[] = (await testDataReader.readRating(pathToCsv, true)).topics;
        //console.log(topics);
        const maxPointsCalculator: MaxPointsCalculator = new MaxPointsCalculator(companyFacts, regionRepository);
        await maxPointsCalculator.updateMaxPointsAndPoints(topics, BalanceSheetType.Full);
        const expected: Topic[] = (await testDataReader.readRating(pathToCsv, false)).topics;
        Assertions.assertTopics(topics, expected);
        done();
    })

    it('should calculate rating when the company facts values filled out and estimations, and weights are set', async (done) => {
        const companyFacts: CompanyFacts = CompanyFacts1;
        const testDataReader = new TestDataReader();
        const pathToCsv = path.join(__dirname, 'testData', "fullRating1.csv");
        const topics: Topic[] = (await testDataReader.readRating(pathToCsv, true)).topics;
        //console.log(topics);
        const maxPointsCalculator: MaxPointsCalculator = new MaxPointsCalculator(companyFacts, regionRepository);
        await maxPointsCalculator.updateMaxPointsAndPoints(topics, BalanceSheetType.Full);
        const expected: Topic[] = (await testDataReader.readRating(pathToCsv, false)).topics;
        Assertions.assertTopics(topics, expected);
        done();
    })
})
