import { DatabaseConnectionCreator } from '../../src/database.connection.creator';
import App from '../../src/app';
import { ConfigurationReader } from '../../src/configuration.reader';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '../../src/entities/enums';
import { Topic } from '../../src/entities/topic';
import { EmptyCompanyFacts } from '../testData/company.facts';
import { Connection } from 'typeorm';
import { Application } from 'express';
import { TokenProvider } from '../TokenProvider';
import supertest = require('supertest');

describe('Balance Sheet Controller', () => {
  let connection: Connection;
  let app: Application;
  const configuration = ConfigurationReader.read();
  let balanceSheetJson: any;
  const endpointPath = '/v1/balancesheets';
  const tokenHeader = {
    key: 'Authorization',
    value: '',
  };

  beforeAll(async (done) => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        configuration
      );
    app = new App(connection, configuration).app;
    tokenHeader.value = `Bearer ${await TokenProvider.provideValidToken(
      app,
      connection
    )}`;
    done();
  });

  afterAll(async (done) => {
    await connection.close();
    done();
  });

  beforeEach(() => {
    balanceSheetJson = {
      type: BalanceSheetType.Full,
      version: BalanceSheetVersion.v5_0_4,
      companyFacts: EmptyCompanyFacts,
    };
  });

  it('get balance sheet by id where company facts fields are empty', async (done) => {
    const testApp = supertest(app);
    const postResponse = await testApp
      .post(endpointPath)
      .set(tokenHeader.key, tokenHeader.value)
      .send(balanceSheetJson);
    const response = await testApp
      .get(`${endpointPath}/${postResponse.body.id}`)
      .set(tokenHeader.key, tokenHeader.value)
      .send();
    expect(response.status).toEqual(200);
    expect(response.body.companyFacts).toMatchObject(
      postResponse.body.companyFacts
    );
    expect(response.body.rating).toMatchObject(postResponse.body.rating);
    expect(
      response.body.rating.topics.reduce(
        (sum: number, current: Topic) => sum + current.maxPoints,
        0
      )
    ).toBeCloseTo(999.9999999999998);
    done();
  });

  it('get matrix representation of balance sheet by id', async (done) => {
    const testApp = supertest(app);
    const postResponse = await testApp
      .post(endpointPath)
      .set(tokenHeader.key, tokenHeader.value)
      .send(balanceSheetJson);
    const response = await testApp
      .get(`${endpointPath}/${postResponse.body.id}/matrix`)
      .set(tokenHeader.key, tokenHeader.value)
      .send();
    expect(response.status).toEqual(200);
    expect(response.body.topics).toHaveLength(20);
    done();
  });
});
