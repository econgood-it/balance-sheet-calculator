import { DatabaseSourceCreator } from '../../../src/databaseSourceCreator';
import App from '../../../src/app';
import { ConfigurationReader } from '../../../src/reader/configuration.reader';

import { DataSource } from 'typeorm';
import { Application } from 'express';
import { AuthBuilder } from '../../AuthBuilder';
import { CORRELATION_HEADER_NAME } from '../../../src/middleware/correlation.id.middleware';
import { OldRating, RatingResponseBody } from '../../../src/models/oldRating';
import { RepoProvider } from '../../../src/repositories/repo.provider';
import { OrganizationBuilder } from '../../OrganizationBuilder';
import { InMemoryAuthentication } from '../in.memory.authentication';
import supertest = require('supertest');

describe('Balance Sheet Controller', () => {
  let dataSource: DataSource;
  let app: Application;
  const configuration = ConfigurationReader.read();
  const balanceSheetsEndpoint = '/v1/balancesheets';
  const authBuilder = new AuthBuilder();
  const auth = authBuilder.addUser();
  const authWithoutOrgaPermissions = authBuilder.addUser();
  const organizationBuilder = new OrganizationBuilder().addMember(auth.user);

  beforeAll(async () => {
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    app = new App(
      dataSource,
      configuration,
      new RepoProvider(configuration),
      new InMemoryAuthentication(authBuilder.getTokenMap())
    ).app;
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  const createBalanceSheet = async () => {
    const [balanceSheetEntity] = (
      await organizationBuilder.addBalanceSheetEntity().build(dataSource)
    ).organizationEntity.balanceSheetEntities!;
    return balanceSheetEntity;
  };

  it('get balance sheet by id where company facts fields are empty', async () => {
    const testApp = supertest(app);
    const createdBalanceSheet = await createBalanceSheet();

    const response = await testApp
      .get(`${balanceSheetsEndpoint}/${createdBalanceSheet.id}`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .send();
    expect(response.status).toEqual(200);
    expect(response.body.companyFacts).toMatchObject(
      createdBalanceSheet.toJson('en').companyFacts
    );
    expect(response.body.ratings).toMatchObject(
      createdBalanceSheet.toJson('en').ratings
    );
    expect(
      response.body.ratings
        .filter((r: RatingResponseBody) => r.shortName.length === 2)
        .reduce((sum: number, current: OldRating) => sum + current.maxPoints, 0)
    ).toBeCloseTo(999.9999999999998);
  });

  it('get matrix representation of balance sheet by id', async () => {
    const testApp = supertest(app);
    const createdBalanceSheet = await createBalanceSheet();
    const response = await testApp
      .get(`${balanceSheetsEndpoint}/${createdBalanceSheet.id}/matrix`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .send();
    expect(response.status).toEqual(200);
    expect(response.body.ratings).toHaveLength(20);
  });

  it('get balance sheet in a short format', async () => {
    const testApp = supertest(app);
    const createdBalanceSheet = await createBalanceSheet();
    const response = await testApp
      .get(`${balanceSheetsEndpoint}/${createdBalanceSheet.id}`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
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
      const createdBalanceSheet = await createBalanceSheet();

      return testApp
        .get(`${balanceSheetsEndpoint}/${createdBalanceSheet.id}${endpoint}`)
        .set(
          authWithoutOrgaPermissions.toHeaderPair().key,
          authWithoutOrgaPermissions.toHeaderPair().value
        )
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
      .get(`${balanceSheetsEndpoint}/9999999`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .set(CORRELATION_HEADER_NAME, 'my-own-corr-id')
      .send();
    expect(response.status).toEqual(404);
    expect(response.headers[CORRELATION_HEADER_NAME]).toBe('my-own-corr-id');
  });

  it('creates correlation id on get request', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .get(`${balanceSheetsEndpoint}/9999999`)
      .set(auth.toHeaderPair().key, auth.toHeaderPair().value)
      .send();
    expect(response.status).toEqual(404);
    expect(response.headers[CORRELATION_HEADER_NAME]).toBeDefined();
  });
});
