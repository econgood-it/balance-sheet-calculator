import supertest from 'supertest';
import { Connection } from 'typeorm';
import { DatabaseConnectionCreator } from '../../../src/database.connection.creator';
import App from '../../../src/app';
import { Application } from 'express';
import { ConfigurationReader } from '../../../src/configuration.reader';

import { TokenProvider } from '../../TokenProvider';
import { CORRELATION_HEADER_NAME } from '../../../src/middleware/correlation.id.middleware';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '../../../src/models/balance.sheet';
import { companyFactsJsonFactory } from '../../testData/balance.sheet';
import { Rating } from '../../../src/models/rating';

describe('Update endpoint of Balance Sheet Controller', () => {
  let connection: Connection;
  let app: Application;
  const configuration = ConfigurationReader.read();
  const endpointPath = '/v1/balancesheets';
  const tokenHeader = {
    key: 'Authorization',
    value: '',
  };
  beforeAll(async () => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        configuration
      );
    app = new App(connection, configuration).app;
    tokenHeader.value = `Bearer ${await TokenProvider.provideValidUserToken(
      app,
      connection
    )}`;
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should update company facts of balance sheet', async () => {
    const testApp = supertest(app);

    let response = await testApp
      .post(endpointPath)
      .set(tokenHeader.key, tokenHeader.value)
      .send({
        type: BalanceSheetType.Compact,
        version: BalanceSheetVersion.v5_0_4,
        companyFacts: companyFactsJsonFactory.empty(),
      });
    const balanceSheetUpdate = {
      companyFacts: {
        totalPurchaseFromSuppliers: 30000,
        totalStaffCosts: 1000,
        profit: 3020999,
        financialCosts: 98098,
        incomeFromFinancialInvestments: 7000,
        additionsToFixedAssets: 102999,
        turnover: 30,
        totalAssets: 40,
        numberOfEmployees: 0,
        supplyFractions: [
          { industryCode: 'A', countryCode: 'GBR', costs: 300 },
          { industryCode: 'Ce', countryCode: 'BEL', costs: 300 },
        ],
        employeesFractions: [
          { countryCode: 'GBR', percentage: 0.2 },
          { countryCode: 'BEL', percentage: 0.4 },
        ],
        industrySectors: [],
      },
    };
    response = await testApp
      .patch(`${endpointPath}/${response.body.id}`)
      .set(tokenHeader.key, tokenHeader.value)
      .send({ ...balanceSheetUpdate });
    expect(response.status).toEqual(200);
    expect(response.body.companyFacts).toMatchObject(
      balanceSheetUpdate.companyFacts
    );
  });

  it('should update ratings of balance sheet', async () => {
    const testApp = supertest(app);

    let response = await testApp
      .post(endpointPath)
      .set(tokenHeader.key, tokenHeader.value)
      .send({
        type: BalanceSheetType.Full,
        version: BalanceSheetVersion.v5_0_6,
        companyFacts: companyFactsJsonFactory.nonEmpty(),
      });
    const balanceSheetUpdate = {
      ratings: [
        { shortName: 'A1.1', estimations: 2 },
        { shortName: 'A1.2', estimations: -100 },
        { shortName: 'A2.1', estimations: 4 },
        { shortName: 'B1.1', estimations: 0 },
        { shortName: 'B1.2', estimations: 5 },
        { shortName: 'E3.3', estimations: -3 },
      ],
    };
    response = await testApp
      .patch(`${endpointPath}/${response.body.id}`)
      .set(tokenHeader.key, tokenHeader.value)
      .send({ ...balanceSheetUpdate });
    expect(response.status).toEqual(200);
    for (const rating of balanceSheetUpdate.ratings) {
      const aspect = findAspect(rating.shortName, response);
      expect(aspect).toMatchObject(rating);
    }
  });

  it('should update rating of full balance sheet', async () => {
    await testEstimationsUpdate(BalanceSheetType.Full);
  });

  it('should update rating of compact balance sheet', async () => {
    await testEstimationsUpdate(BalanceSheetType.Compact);
  });

  async function testEstimationsUpdate(
    balanceSheetType: BalanceSheetType
  ): Promise<void> {
    const testApp = supertest(app);

    let response = await testApp
      .post(endpointPath)
      .set(tokenHeader.key, tokenHeader.value)
      .send({
        type: balanceSheetType,
        version: BalanceSheetVersion.v5_0_4,
        companyFacts: companyFactsJsonFactory.nonEmpty(),
      });
    const balanceSheetUpdate = {
      ratings: [
        {
          shortName: 'A1',
        },
        {
          shortName: 'A1.1',
          estimations: 6,
        },
        {
          shortName: 'A1.2',
          estimations: -200,
        },
      ],
    };
    response = await testApp
      .patch(`${endpointPath}/${response.body.id}`)
      .set(tokenHeader.key, tokenHeader.value)
      .send({ ...balanceSheetUpdate });
    expect(response.status).toEqual(200);
    const aspectA11 = findAspect('A1.1', response);
    expect(aspectA11).toMatchObject({
      shortName: 'A1.1',
      estimations: 6,
    });
    const aspectA12 = findAspect('A1.2', response);
    expect(aspectA12).toMatchObject({
      shortName: 'A1.2',
      estimations: -200,
    });
  }

  function findAspect(shortName: string, response: any): Rating | undefined {
    return response.body.ratings.find(
      (r: { shortName: string }) => r.shortName === shortName
    );
  }

  describe('block access to balance sheet ', () => {
    let tokenOfUnauthorizedUser: string;
    beforeAll(async () => {
      tokenOfUnauthorizedUser = `Bearer ${await TokenProvider.provideValidUserToken(
        app,
        connection,
        'unauthorizedUser@example.com'
      )}`;
    });

    const postAndPatchWithDifferentUsers = async (): Promise<any> => {
      const testApp = supertest(app);
      const postResponse = await testApp
        .post(endpointPath)
        .set(tokenHeader.key, tokenHeader.value)
        .send({
          type: BalanceSheetType.Compact,
          version: BalanceSheetVersion.v5_0_4,
          companyFacts: companyFactsJsonFactory.nonEmpty(),
        });
      const balanceSheetUpdate = {
        id: postResponse.body.id,
        companyFacts: {
          totalPurchaseFromSuppliers: 30000,
        },
      };

      return await testApp
        .patch(`${endpointPath}/${postResponse.body.id}`)
        .set(tokenHeader.key, tokenOfUnauthorizedUser)
        .send({ ...balanceSheetUpdate });
    };

    it('when patch endpoint is called', async () => {
      const response = await postAndPatchWithDifferentUsers();
      expect(response.status).toEqual(403);
    });
  });

  it('returns given correlation id on update request', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .put(`${endpointPath}/9999999`)
      .set(tokenHeader.key, tokenHeader.value)
      .set(CORRELATION_HEADER_NAME, 'my-own-corr-id')
      .send();
    expect(response.status).toEqual(404);
    expect(response.headers[CORRELATION_HEADER_NAME]).toBe('my-own-corr-id');
  });

  it('creates correlation id on put request', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .put(`${endpointPath}/9999999`)
      .set(tokenHeader.key, tokenHeader.value)
      .send();
    expect(response.status).toEqual(404);
    expect(response.headers[CORRELATION_HEADER_NAME]).toBeDefined();
  });
});
