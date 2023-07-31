import { DatabaseSourceCreator } from '../../../src/databaseSourceCreator';
import App from '../../../src/app';
import { ConfigurationReader } from '../../../src/reader/configuration.reader';

import { DataSource } from 'typeorm';
import { Application } from 'express';
import { Auth, AuthBuilder } from '../../AuthBuilder';
import { CORRELATION_HEADER_NAME } from '../../../src/middleware/correlation.id.middleware';
import { Rating, RatingResponseBody } from '../../../src/models/rating';

import { companyFactsJsonFactory } from '../../../src/openapi/examples';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { RepoProvider } from '../../../src/repositories/repo.provider';
import supertest = require('supertest');

describe('Balance Sheet Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  let balanceSheetJson: any;
  const endpointPath = '/v1/balancesheets';
  let auth: Auth;
  let auth2: Auth;

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    app = new App(dataSource, configuration, new RepoProvider(configuration))
      .app;
    auth = await new AuthBuilder(app, dataSource).build();
    auth2 = await new AuthBuilder(app, dataSource).build();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(() => {
    balanceSheetJson = {
      type: BalanceSheetType.Full,
      version: BalanceSheetVersion.v5_0_8,
      companyFacts: companyFactsJsonFactory.emptyRequest(),
    };
  });

  const createBalanceSheet = async (authUser: Auth) => {
    const testApp = supertest(app);
    return testApp
      .post(endpointPath)
      .set(authUser.authHeader.key, authUser.authHeader.value)
      .send(balanceSheetJson);
  };

  it('get balance sheet by id where company facts fields are empty', async () => {
    const testApp = supertest(app);
    const postResponse = await createBalanceSheet(auth);
    expect(postResponse.status).toEqual(200);
    const response = await testApp
      .get(`${endpointPath}/${postResponse.body.id}`)
      .set(auth.authHeader.key, auth.authHeader.value)
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
      expectedIds.push((await createBalanceSheet(auth)).body.id);
    }
    const balanceSheetIdOfUser2 = (await createBalanceSheet(auth2)).body.id;
    const response = await testApp
      .get(`${endpointPath}`)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send();
    for (const id of expectedIds) {
      expect(response.body).toContainEqual({ id });
    }
    expect(response.body).not.toContainEqual({ id: balanceSheetIdOfUser2 });
  });

  it('get matrix representation of balance sheet by id', async () => {
    const testApp = supertest(app);
    const postResponse = await createBalanceSheet(auth);
    const response = await testApp
      .get(`${endpointPath}/${postResponse.body.id}/matrix`)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send();
    expect(response.status).toEqual(200);
    expect(response.body.ratings).toHaveLength(20);
  });

  it('get balance sheet in a short format', async () => {
    const testApp = supertest(app);
    const postResponse = await createBalanceSheet(auth);
    const response = await testApp
      .get(`${endpointPath}/${postResponse.body.id}`)
      .set(auth.authHeader.key, auth.authHeader.value)
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
      const postResponse = await createBalanceSheet(auth);
      return testApp
        .get(`${endpointPath}/${postResponse.body.id}${endpoint}`)
        .set(auth2.authHeader.key, auth2.authHeader.value)
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
      .set(auth.authHeader.key, auth.authHeader.value)
      .set(CORRELATION_HEADER_NAME, 'my-own-corr-id')
      .send();
    expect(response.status).toEqual(404);
    expect(response.headers[CORRELATION_HEADER_NAME]).toBe('my-own-corr-id');
  });

  it('creates correlation id on get request', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .get(`${endpointPath}/9999999`)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send();
    expect(response.status).toEqual(404);
    expect(response.headers[CORRELATION_HEADER_NAME]).toBeDefined();
  });
});
