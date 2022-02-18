import { DatabaseConnectionCreator } from '../../../src/database.connection.creator';
import App from '../../../src/app';
import { ConfigurationReader } from '../../../src/configuration.reader';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '../../../src/entities/enums';
import { Topic } from '../../../src/entities/topic';
import { EmptyCompanyFactsJson } from '../../testData/company.facts';
import { Connection } from 'typeorm';
import { Application } from 'express';
import { TokenProvider } from '../../TokenProvider';
import supertest = require('supertest');
import { CORRELATION_HEADER_NAME } from '../../../src/middleware/correlation.id.middleware';

describe('Balance Sheet Controller', () => {
  let connection: Connection;
  let app: Application;
  const configuration = ConfigurationReader.read();
  let balanceSheetJson: any;
  const endpointPath = '/v1/balancesheets';
  const authHeaderKey = 'Authorization';
  let token = '';
  let tokenUser2 = '';

  beforeAll(async () => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        configuration
      );
    app = new App(connection, configuration).app;
    token = `Bearer ${await TokenProvider.provideValidUserToken(
      app,
      connection
    )}`;
    tokenUser2 = `Bearer ${await TokenProvider.provideValidUserToken(
      app,
      connection,
      'user2@example.com'
    )}`;
  });

  afterAll(async () => {
    await connection.close();
  });

  beforeEach(() => {
    balanceSheetJson = {
      type: BalanceSheetType.Full,
      version: BalanceSheetVersion.v5_0_4,
      companyFacts: EmptyCompanyFactsJson,
    };
  });

  const createBalanceSheet = async (tokenOfUser: string) => {
    const testApp = supertest(app);
    return testApp
      .post(endpointPath)
      .set(authHeaderKey, tokenOfUser)
      .send(balanceSheetJson);
  };

  it('get balance sheet by id where company facts fields are empty', async () => {
    const testApp = supertest(app);
    const postResponse = await createBalanceSheet(token);
    const response = await testApp
      .get(`${endpointPath}/${postResponse.body.id}`)
      .set(authHeaderKey, token)
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
  });

  it('get balance sheets of current user', async () => {
    const testApp = supertest(app);
    const expectedIds = [];
    for (let i = 0; i < 2; i++) {
      expectedIds.push((await createBalanceSheet(token)).body.id);
    }
    const balanceSheetIdOfUser2 = (await createBalanceSheet(tokenUser2)).body
      .id;
    const response = await testApp
      .get(`${endpointPath}`)
      .set(authHeaderKey, token)
      .send();
    for (const id of expectedIds) {
      expect(response.body).toContainEqual({ id: id });
    }
    expect(response.body).not.toContainEqual({ id: balanceSheetIdOfUser2 });
  });

  it('get matrix representation of balance sheet by id', async () => {
    const testApp = supertest(app);
    const postResponse = await createBalanceSheet(token);
    const response = await testApp
      .get(`${endpointPath}/${postResponse.body.id}/matrix`)
      .set(authHeaderKey, token)
      .send();
    expect(response.status).toEqual(200);
    expect(response.body.topics).toHaveLength(20);
  });

  describe('block access to balance sheet ', () => {
    const postAndGetWithDifferentUsers = async (
      endpoint: string
    ): Promise<any> => {
      const testApp = supertest(app);
      const postResponse = await createBalanceSheet(token);
      return testApp
        .get(`${endpointPath}/${postResponse.body.id}${endpoint}`)
        .set(authHeaderKey, tokenUser2)
        .send();
    };

    it('when get endpoint is called', async () => {
      const response = await postAndGetWithDifferentUsers('');
      expect(response.status).toEqual(403);
    });
    it('when matrix endpoint is called', async () => {
      const response = await postAndGetWithDifferentUsers('/matrix');
      expect(response.status).toEqual(403);
    });
  });

  it('returns given correlation id on get request', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .get(`${endpointPath}/9999999`)
      .set(authHeaderKey, token)
      .set(CORRELATION_HEADER_NAME, 'my-own-corr-id')
      .send();
    expect(response.status).toEqual(404);
    expect(response.headers[CORRELATION_HEADER_NAME]).toBe('my-own-corr-id');
  });

  it('creates correlation id on get request', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .get(`${endpointPath}/9999999`)
      .set(authHeaderKey, token)
      .send();
    expect(response.status).toEqual(404);
    expect(response.headers[CORRELATION_HEADER_NAME]).toBeDefined();
  });
});
