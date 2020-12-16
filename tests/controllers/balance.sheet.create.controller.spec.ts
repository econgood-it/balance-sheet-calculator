
import supertest from "supertest";
import { Connection } from "typeorm";
import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import App from '../../src/app';
import { Application } from "express";
import { ConfigurationReader } from "../../src/configuration.reader";
import { BalanceSheetType, BalanceSheetVersion } from "../../src/entities/enums";
import * as path from 'path';
import { RatingReader } from "../../src/reader/rating.reader";
import { Assertions } from "../Assertions";
import { Topic } from "../../src/entities/topic";
import {IndustrySector} from "../../src/entities/industry.sector";
import {FinanceCalc} from "../../src/calculations/finance.calc";
import {Rating} from "../../src/entities/rating";
import {CompanyFacts} from "../../src/entities/companyFacts";
import {EmptyCompanyFacts} from "../testData/company.facts";
import {readRatingResultForEmptyCompanyFacts} from "../testData/rating.reader";

describe('Balance Sheet Controller', () => {
    let connection: Connection;
    let app: Application;
    const configuration = ConfigurationReader.read();
    let balanceSheetJson: any;
    const endpointPath = '/balancesheets';
    beforeAll(async (done) => {
        connection = await DatabaseConnectionCreator.createConnectionAndRunMigrations(configuration);
        app = new App(connection, configuration).app;
        done();
    })

    afterAll(async (done) => {
        await connection.close();
        done();
    })

    beforeEach(() => {
        balanceSheetJson = {
            type: BalanceSheetType.Full,
            version: BalanceSheetVersion.v5_0_4,
            companyFacts: EmptyCompanyFacts
        }
    })

    it('creates BalanceSheet from company facts', async (done) => {
        const testApp = supertest(app);
        const pathToCsv = path.join(__dirname, "compactRatingExpected.csv");
        const ratingReader: RatingReader = new RatingReader();
        const ratingExpected = await readRatingResultForEmptyCompanyFacts();
        const response = await testApp.post(endpointPath).auth(configuration.appUsername,
            configuration.appPassword).send(balanceSheetJson);
        expect(response.status).toEqual(200);
        const companyFacts = balanceSheetJson.companyFacts as CompanyFacts;
        Assertions.rmIdFieldsOfCompanyFacts(companyFacts)
        expect(response.body.companyFacts).toMatchObject(companyFacts);
        // ignore ids in comparison
        Assertions.rmIdFields(ratingExpected);
        expect(response.body.rating).toMatchObject(ratingExpected);
        expect(response.body.rating.topics.reduce((sum: number, current: Topic) => sum + current.maxPoints, 0)).toBeCloseTo(999.9999999999998);
        done();
    })

    it('creates BalanceSheet where B1 weight is very high', async (done) => {
        const testApp = supertest(app);
        balanceSheetJson.companyFacts.industrySectors = [new IndustrySector(undefined,
          FinanceCalc.INDUSTRY_CODE_FOR_FINANCIAL_SERVICES, 1, 'desc')]
        const response = await testApp.post(endpointPath).auth(configuration.appUsername,
          configuration.appPassword).send(balanceSheetJson);
        expect(response.status).toEqual(200);
        const topicB1: Topic | undefined = (response.body.rating as Rating).topics.find((t: Topic) => t.shortName=='B1');
        expect(topicB1).toBeDefined();
        expect((topicB1 as Topic).weight).toBe(2);
        done();
    })

    it('creates BalanceSheet where B2 weight is high', async (done) => {
        const testApp = supertest(app);
        balanceSheetJson.companyFacts.financialCosts = 0.12;
        const response = await testApp.post(endpointPath).auth(configuration.appUsername,
          configuration.appPassword).send(balanceSheetJson);
        expect(response.status).toEqual(200);
        const topicB2: Topic | undefined = (response.body.rating as Rating).topics.find((t: Topic) => t.shortName=='B2');
        expect(topicB2).toBeDefined();
        expect((topicB2 as Topic).weight).toBe(1.5);
        done();
    })

    it('fails on missing properties in company facts', async (done) => {
        const testApp = supertest(app);

        const companyFacts = {
            totalStaffCosts: 100, profit: 3020, financialCosts: 19, incomeFromFinancialInvestments: 201,
            additionsToFixedAssets: 2019, supplyFractions: [], employeesFractions: []
        }
        await testMissingProperty(companyFacts, testApp, 'totalPurchaseFromSuppliers');
        const companyFacts2 = {
            totalPurchaseFromSuppliers: 300, totalStaffCosts: 100, profit: 3020, incomeFromFinancialInvestments: 201,
            additionsToFixedAssets: 2019, supplyFractions: [], employeesFractions: []
        }
        await testMissingProperty(companyFacts2, testApp, 'financialCosts');
        done();
    })
    async function testMissingProperty(companyFacts: any, testApp: supertest.SuperTest<supertest.Test>,
        missingProperty: string): Promise<void> {
        const response = await testApp.post('/balancesheets').auth(configuration.appUsername,
            configuration.appPassword).send({
                type: BalanceSheetType.Compact, version: BalanceSheetVersion.v5_0_4,
                companyFacts
            });
        const message = 'missing property ';
        expect(response.status).toEqual(400);
        expect(response.text).toMatch(message + missingProperty);
    }


})