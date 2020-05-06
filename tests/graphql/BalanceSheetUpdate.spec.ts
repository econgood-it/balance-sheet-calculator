import app from "../../src/app";
import supertest from "supertest";
import {Environment} from "../../src/environment";
import {MutationBuilder} from "../MutationBuilder";
import {ICompanyFacts} from "../../src/models/companyFacts.model";
import {IBalanceSheet} from "../../src/models/balanceSheet.model";
import {DatabaseHandler} from "../testData/DatabaseHandler";
import {TestDataFactory} from "../testData/TestDataFactory";

describe('Balance Sheet Update', () => {

    const testDataFactory: TestDataFactory = new TestDataFactory();

    afterAll(async (done) => {
        DatabaseHandler.deleteAllEntriesAnddisconnect();
        done();
    })

    it('should throw not found error', async (done) => {
        const testApp = supertest(app);
        const environment = new Environment();
        const output = '{ _id }';
        const query = new MutationBuilder().method(
            'updateBalanceSheet').arguments("id: \"5e95f959b35cc8444684b91d\"").output(output).build();
        const response = await testApp.post('/balancesheets').auth(environment.username as string,
            environment.password as string).send({ query: query});
        expect(response.body.errors[0].message).toBe("Cannot find and update balancesheet with id 5e95f959b35cc8444684b91d");
        done();
    })

    it('should update the values of company facts', async (done) => {
        const testApp = supertest(app);
        const environment = new Environment();
        // Create balance sheet
        const balanceSheet: IBalanceSheet = await testDataFactory.createAndSaveBalanceSheet();
        // Update balance sheet
        const args = `id: \"${balanceSheet.id}\", companyFacts: {profit: 1000000}`;
        const output = '{ _id, companyFacts { profit } }';
        const query = new MutationBuilder().method(
            'updateBalanceSheet').arguments(args).output(output).build();
        const response = await testApp.post('/balancesheets').auth(environment.username as string,
            environment.password as string).send({ query: query});
        const companyFacts: ICompanyFacts = response.body.data.updateBalanceSheet.companyFacts;
        expect(companyFacts.profit).toBe(1000000);
        done();
    })
});

