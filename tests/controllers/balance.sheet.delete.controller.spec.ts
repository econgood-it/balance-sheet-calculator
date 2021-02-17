import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import App from '../../src/app';
import { ConfigurationReader } from "../../src/configuration.reader";
import { BalanceSheetType, BalanceSheetVersion } from "../../src/entities/enums";
import { Topic } from "../../src/entities/topic";
import {EmptyCompanyFacts} from "../testData/company.facts";
import {Connection} from "typeorm";
import supertest = require("supertest");
import {Application} from "express";

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
        const postResponse = await testApp.post(endpointPath).auth(configuration.appUsername,
          configuration.appPassword).send(balanceSheetJson);

        const response = await testApp.delete(`${endpointPath}/${postResponse.body.id}`).auth(
            configuration.appUsername, configuration.appPassword).send();
        expect(response.status).toEqual(200);

        const responseGet = await testApp.get(`${endpointPath}/${postResponse.body.id}`).auth(
          configuration.appUsername, configuration.appPassword).send();
        expect(responseGet.status).toEqual(404);
        done();
    })



})