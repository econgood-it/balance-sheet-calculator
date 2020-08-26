
import supertest from "supertest";
import { Connection } from "typeorm";
import { DatabaseConnectionCreator } from '../../src/DatabaseConnectionCreator';
import App from '../../src/app';
import { Application } from "express";
import { ConfigurationReader } from "../../src/configurationReader";
import { BalanceSheetType } from "../../src/entities/enums";

describe('Create endpoint of Balance Sheet Controller', () => {
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

    it('should create BalanceSheet from company facts', async (done) => {
        const testApp = supertest(app);
        const balanceSheetJson = {
            type: BalanceSheetType.Compact,
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
        const rating = {
            topics: [
                { shortName: 'A1', points: 0, estimations: 0, weight: 1, maxPoints: 25 },
                { shortName: 'A2', points: 0, estimations: 0, weight: 1, maxPoints: 25 },
                { shortName: 'A3', points: 0, estimations: 0, weight: 1, maxPoints: 25 },
                { shortName: 'A4', points: 0, estimations: 0, weight: 1, maxPoints: 25 },
                { shortName: 'B1', points: 0, estimations: 0, weight: 1, maxPoints: 100 },
                { shortName: 'B2', points: 0, estimations: 0, weight: 1, maxPoints: 100 },
                { shortName: 'B3', points: 0, estimations: 0, weight: 1, maxPoints: 100 },
                { shortName: 'B4', points: 0, estimations: 0, weight: 1, maxPoints: 100 },
                { shortName: 'C1', points: 0, estimations: 0, weight: 1, maxPoints: 25 },
                { shortName: 'C2', points: 0, estimations: 0, weight: 1, maxPoints: 25 },
                { shortName: 'C3', points: 0, estimations: 0, weight: 1, maxPoints: 25 },
                { shortName: 'C4', points: 0, estimations: 0, weight: 1, maxPoints: 25 },
                { shortName: 'D1', points: 0, estimations: 0, weight: 1, maxPoints: 50 },
                { shortName: 'D2', points: 0, estimations: 0, weight: 1, maxPoints: 50 },
                { shortName: 'D3', points: 0, estimations: 0, weight: 1, maxPoints: 50 },
                { shortName: 'D4', points: 0, estimations: 0, weight: 1, maxPoints: 50 },
                { shortName: 'E1', points: 0, estimations: 0, weight: 1, maxPoints: 50 },
                { shortName: 'E2', points: 0, estimations: 0, weight: 1, maxPoints: 50 },
                { shortName: 'E3', points: 0, estimations: 0, weight: 1, maxPoints: 50 },
                { shortName: 'E4', points: 0, estimations: 0, weight: 1, maxPoints: 50 },
            ]
        }

        const response = await testApp.post('/balancesheets').auth(configuration.appUsername,
            configuration.appPassword).send(balanceSheetJson);
        expect(response.status).toEqual(200);
        expect(response.body.companyFacts).toMatchObject(balanceSheetJson.companyFacts);
        expect(response.body.rating).toMatchObject(rating);
        done();
    })

    it('should fail on missing properties in company facts', async (done) => {
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
            configuration.appPassword).send({ type: BalanceSheetType.Compact, companyFacts });
        const message = 'missing property ';
        expect(response.status).toEqual(400);
        expect(response.text).toMatch(message + missingProperty);
    }


})