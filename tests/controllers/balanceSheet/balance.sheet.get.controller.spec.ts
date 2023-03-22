import { DatabaseConnectionCreator } from '../../../src/database.connection.creator';
import App from '../../../src/app';
import { ConfigurationReader } from '../../../src/configuration.reader';

import { Connection } from 'typeorm';
import { Application } from 'express';
import { TokenProvider } from '../../TokenProvider';
import { CORRELATION_HEADER_NAME } from '../../../src/middleware/correlation.id.middleware';
import { Rating, RatingResponseBody } from '../../../src/models/rating';

import { companyFactsJsonFactory } from '../../../src/openapi/examples';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from 'e-calculator-schemas/dist/shared.schemas';
import supertest = require('supertest');

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
      companyFacts: companyFactsJsonFactory.empty(),
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
    expect(postResponse.status).toEqual(200);
    const response = await testApp
      .get(`${endpointPath}/${postResponse.body.id}`)
      .set(authHeaderKey, token)
      .send();
    expect(response.status).toEqual(200);
    expect(response.body.companyFacts).toMatchObject(
      postResponse.body.companyFacts
    );
    expect(response.body.ratings).toMatchObject(postResponse.body.ratings);
    expect(
      response.body.ratings
        .filter((r: RatingResponseBody) => r.shortName.length === 2)
        .reduce((sum: number, current: Rating) => sum + current.maxPoints, 0)
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
      expect(response.body).toContainEqual({ id });
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
    expect(response.body.ratings).toHaveLength(20);
  });

  it('get balance sheet in a short format', async () => {
    const testApp = supertest(app);
    const postResponse = await createBalanceSheet(token);
    const response = await testApp
      .get(`${endpointPath}/${postResponse.body.id}`)
      .set(authHeaderKey, token)
      .send();
    expect(response.status).toEqual(200);
    expect(response.body.ratings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          shortName: 'A1',
          estimations: 0,
          name: 'Human dignity in the supply chain',
          weight: 1,
        }),
        expect.objectContaining({
          estimations: 0,
          name: 'Financial independence through equity financing',
          shortName: 'B1.1',
          weight: 1,
          isPositive: true,
        }),
        expect.objectContaining({
          shortName: 'E4.2',
          name: 'Social participation',
          weight: 1,
          estimations: 0,
          isPositive: true,
        }),
      ])
    );
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
