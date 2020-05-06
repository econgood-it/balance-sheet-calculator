import app from "../../src/app";
import supertest from "supertest";
import {Environment} from "../../src/environment";
import {MutationBuilder} from "../MutationBuilder";
import {ICompanyFacts} from "../../src/models/companyFacts.model";
import {IRating} from "../../src/models/rating.model";
import {DatabaseHandler} from "../testData/DatabaseHandler";


describe('Balance Sheet API', () => {
    afterAll(async (done) => {
        DatabaseHandler.deleteAllEntriesAnddisconnect();
        done();
    })
    it('should create a new balance sheet', async (done) => {
        const testApp = supertest(app);
        const environment = new Environment();
        const args = 'profit: 77, totalStaffCosts: 709, financialCosts: 302, ' +
            'totalPurchaseFromSuppliers: 201, incomeFromFinancialInvestments: 908' +
            'additionsToFixedAssets: 45,' +
            'supplyFractions: [ {countryCode: "DE", costs: 10} ]' +
            'employeesFractions: [ {countryCode: "DE", percentage: 0.9} ]'
        const output = '{ companyFacts { ' +
            'profit, totalStaffCosts, financialCosts, ' +
            'totalPurchaseFromSuppliers, incomeFromFinancialInvestments,' +
            'additionsToFixedAssets, supplyFractions { countryCode, costs },' +
            'employeesFractions { countryCode, percentage } }' +
            'rating {topics {shortName} } }';
        const query = new MutationBuilder().method(
            'createBalanceSheet').arguments(args).output(output).build();
        const response = await testApp.post('/balancesheets').auth(environment.username as string,
            environment.password as string).send({ query: query});

        expect(response.status).toBe(200);
        const companyFacts: ICompanyFacts = response.body.data.createBalanceSheet.companyFacts;
        expect(companyFacts.profit).toBe((77));
        expect(companyFacts.totalStaffCosts).toBe((709));
        expect(companyFacts.financialCosts).toBe((302));
        expect(companyFacts.totalPurchaseFromSuppliers).toBe((201));
        expect(companyFacts.incomeFromFinancialInvestments).toBe((908));
        expect(companyFacts.additionsToFixedAssets).toBe((45));
        expect(companyFacts.supplyFractions).toHaveLength(1);
        expect(companyFacts.supplyFractions[0].costs).toBe(10);
        expect(companyFacts.supplyFractions[0].countryCode).toBe('DE');
        expect(companyFacts.employeesFractions).toHaveLength(1);
        const rating: IRating = response.body.data.createBalanceSheet.rating;
        expect(rating.topics).toHaveLength(5);
        expect(rating.topics[0].shortName).toBe('A1');
        done();
    })

});

