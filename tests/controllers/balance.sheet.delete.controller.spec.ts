import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import App from '../../src/app';
import { ConfigurationReader } from "../../src/configuration.reader";
import { BalanceSheetType, BalanceSheetVersion } from "../../src/entities/enums";
import { Topic } from "../../src/entities/topic";
import {EmptyCompanyFacts} from "../testData/company.facts";
import {Connection} from "typeorm";
import supertest = require("supertest");
import {Application} from "express";
import {Rating} from "../../src/entities/rating";
import {CompanyFacts} from "../../src/entities/companyFacts";
import {Aspect} from "../../src/entities/aspect";
import {SupplyFraction} from "../../src/entities/supplyFraction";
import {IndustrySector} from "../../src/entities/industry.sector";
import {EmployeesFraction} from "../../src/entities/employeesFraction";

describe('Balance Sheet Controller', () => {
    let connection: Connection;
    let app: Application;
    const configuration = ConfigurationReader.read();
    let balanceSheetJson: any;
    const endpointPath = '/v1/balancesheets';

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

    it(' deletes balance sheet by id', async (done) => {
        const testApp = supertest(app);
        balanceSheetJson.companyFacts.industrySectors = [{industryCode: "A", amountOfTotalTurnover: 0.8,
            description: "My description"}]
        balanceSheetJson.companyFacts.supplyFractions = [{countryCode: "DEU", industryCode: "A", costs: 300 }]
        balanceSheetJson.companyFacts.employeesFractions = [{countryCode: "DEU", percentage: 0.8 }]
        const postResponse = await testApp.post(endpointPath).auth(configuration.appUsername,
          configuration.appPassword).send(balanceSheetJson);

        const response = await testApp.delete(`${endpointPath}/${postResponse.body.id}`).auth(
            configuration.appUsername, configuration.appPassword).send();
        expect(response.status).toEqual(200);

        const responseGet = await testApp.get(`${endpointPath}/${postResponse.body.id}`).auth(
          configuration.appUsername, configuration.appPassword).send();
        expect(responseGet.status).toEqual(404);

        // Test if all relations marked with cascade true are deleted as well
        const expectZeroCount = 0;
        // Rating
        expect(await connection.getRepository(Rating).count({id: postResponse.body.rating.id})).toBe(
          expectZeroCount);
        // Topics
        expect(await connection.getRepository(Topic).count({rating: postResponse.body.rating})).toBe(
          expectZeroCount);
        // Aspects
        for(const topic of postResponse.body.rating.topics) {
            expect(await connection.getRepository(Aspect).count({topic: topic})).toBe(
              expectZeroCount);
        }

        // Company Facts
        expect(await connection.getRepository(CompanyFacts).count({id: postResponse.body.companyFacts.id})).toBe(
          expectZeroCount);
        // Industry Sectors
        expect(await connection.getRepository(IndustrySector).count({companyFacts:
            postResponse.body.companyFacts})).toBe(expectZeroCount);
        // Supply Fractions
        expect(await connection.getRepository(SupplyFraction).count({companyFacts:
            postResponse.body.companyFacts})).toBe(expectZeroCount);
        // EmployeesFractions
        expect(await connection.getRepository(EmployeesFraction).count({companyFacts:
            postResponse.body.companyFacts})).toBe(expectZeroCount);

        done();
    })







})