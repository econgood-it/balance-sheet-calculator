
import supertest from "supertest";
import { Connection } from "typeorm";
import { DatabaseConnectionCreator } from '../../src/DatabaseConnectionCreator';
import App from '../../src/app';
import { Application } from "express";
import { ConfigurationReader } from "../../src/configurationReader";
import { BalanceSheetType, BalanceSheetVersion } from "../../src/entities/enums";

describe('Update endpoint of Balance Sheet Controller', () => {
    let connection: Connection;
    let app: Application;
    const configuration = ConfigurationReader.read();
    beforeAll(async (done) => {
        connection = await DatabaseConnectionCreator.createConnectionAndRunMigrations(configuration);
        app = new App(connection, configuration).app;
        done();
    })

    afterAll(async (done) => {
        await connection.close();
        done();
    })

    it('should update company facts of balance sheet', async (done) => {
        const testApp = supertest(app);
        const companyFacts = {
            totalPurchaseFromSuppliers: 300,
            totalStaffCosts: 100,
            profit: 3020,
            financialCosts: 19,
            incomeFromFinancialInvestments: 201,
            additionsToFixedAssets: 2019,
            supplyFractions: [{
                countryCode: "DE",
                costs: 300
            }],
            employeesFractions: [{
                countryCode: "DE",
                percentage: 0.8
            }]
        }

        let response = await testApp.post('/balancesheets').auth(configuration.appUsername,
            configuration.appPassword).send({
                type: BalanceSheetType.Compact, version: BalanceSheetVersion.v5_0_4,
                companyFacts
            });
        const balanceSheetUpdate = {
            id: response.body.id,
            companyFacts: {
                id: response.body.companyFacts.id,
                totalPurchaseFromSuppliers: 30000,
                totalStaffCosts: 1000,
                profit: 3020999,
                financialCosts: 98098,
                incomeFromFinancialInvestments: 7000,
                additionsToFixedAssets: 102999,
                supplyFractions: [
                    { countryCode: "GB", costs: 300 },
                    { countryCode: "B", costs: 300 }
                ],
                employeesFractions: [
                    { countryCode: "GB", percentage: 0.2 },
                    { countryCode: "B", percentage: 0.4 }
                ]
            }
        }
        response = await testApp.patch(`/balancesheets/${response.body.id}`).auth(configuration.appUsername,
            configuration.appPassword).send({ ...balanceSheetUpdate });
        expect(response.status).toEqual(200);
        expect(response.body.companyFacts).toMatchObject(balanceSheetUpdate.companyFacts);
        //expect(response.body.rating).toMatchObject(rating);
        done();
    })

})