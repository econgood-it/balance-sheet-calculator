
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
import {EmptyCompanyFacts} from "../testData/company.facts";
import {readRatingResultForEmptyCompanyFacts} from "../testData/rating.reader";
import {CompanyFacts} from "../../src/entities/companyFacts";

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

    it('get balance sheet by id where company facts fields are empty', async (done) => {
        const testApp = supertest(app);
        const postResponse = await testApp.post(endpointPath).auth(configuration.appUsername,
            configuration.appPassword).send(balanceSheetJson);
        const ratingExpected = await readRatingResultForEmptyCompanyFacts();
        const response = await testApp.get(`${endpointPath}/${postResponse.body.id}`).auth(configuration.appUsername,
            configuration.appPassword).send();
        expect(response.status).toEqual(200);
        const companyFacts = balanceSheetJson.companyFacts as CompanyFacts;
        Assertions.rmIdFieldsOfCompanyFacts(companyFacts);
        expect(response.body.companyFacts).toMatchObject(balanceSheetJson.companyFacts);
        // ignore ids in comparison
        Assertions.rmIdFields(ratingExpected);
        expect(response.body.rating).toMatchObject(ratingExpected);
        expect(response.body.rating.topics.reduce((sum: number, current: Topic) => sum + current.maxPoints,
          0)).toBeCloseTo(999.9999999999998);
        done();
    })



})