
import supertest from "supertest";
import { Connection } from "typeorm";
import { DatabaseConnectionCreator } from '../../src/DatabaseConnectionCreator';
import App from '../../src/app';
import { Application } from "express";
import { ConfigurationReader } from "../../src/configurationReader";
import { BalanceSheetType, BalanceSheetVersion } from "../../src/entities/enums";
import * as path from 'path';
import { RatingReader } from "../../src/reader/RatingReader";
import { Assertions } from "../Assertions";
import { Topic } from "../../src/entities/topic";

describe('Get endpoint of Balance Sheet Controller', () => {
    let connection: Connection;
    let app: Application;
    const configuration = ConfigurationReader.read();
    beforeAll(async (done) => {
        connection = await DatabaseConnectionCreator.createConnectionAndRunMigrations(configuration);
        app = new App(connection, configuration).app;
        done();
    })

    afterAll(async (done) => {
        connection.close();
        done();
    })

    it('should get BalanceSheet by id', async (done) => {
        const testApp = supertest(app);
        const balanceSheetJson = {
            type: BalanceSheetType.Compact,
            version: BalanceSheetVersion.v5_0_4,
            companyFacts: {
                totalPurchaseFromSuppliers: 300,
                totalStaffCosts: 100,
                profit: 3020,
                financialCosts: 19,
                incomeFromFinancialInvestments: 201,
                additionsToFixedAssets: 2019,
                supplyFractions: [],
                employeesFractions: []
            }
        }
        // Create balance sheet
        const postResponse = await testApp.post('/balancesheets').auth(configuration.appUsername,
            configuration.appPassword).send(balanceSheetJson);
        const pathToCsv = path.join(__dirname, "compactRatingExpected.csv");
        const ratingReader: RatingReader = new RatingReader();
        const ratingExpected = await ratingReader.readRatingFromCsv(pathToCsv);
        // Get created balance sheet and test its values
        const response = await testApp.get(`/balancesheets/${postResponse.body.id}`).auth(configuration.appUsername,
            configuration.appPassword).send();
        expect(response.status).toEqual(200);
        expect(response.body.companyFacts).toMatchObject(balanceSheetJson.companyFacts);
        // ignore ids in comparison
        Assertions.rmIdFields(ratingExpected);
        expect(response.body.rating).toMatchObject(ratingExpected);
        expect(response.body.rating.topics.reduce((sum: number, current: Topic) => sum + current.maxPoints, 0)).toBe(1000);
        done();
    })

})