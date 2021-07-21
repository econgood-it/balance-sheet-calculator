import { DatabaseConnectionCreator } from '../../../src/database.connection.creator';
import App from '../../../src/app';
import { ConfigurationReader } from '../../../src/configuration.reader';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '../../../src/entities/enums';
import { Topic } from '../../../src/entities/topic';
import { EmptyCompanyFacts } from '../../testData/company.facts';
import { Connection } from 'typeorm';
import { Application } from 'express';
import { Rating } from '../../../src/entities/rating';
import { CompanyFacts } from '../../../src/entities/companyFacts';
import { Aspect } from '../../../src/entities/aspect';
import { SupplyFraction } from '../../../src/entities/supplyFraction';
import { IndustrySector } from '../../../src/entities/industry.sector';
import { EmployeesFraction } from '../../../src/entities/employeesFraction';
import { TokenProvider } from '../../TokenProvider';
import supertest = require('supertest');
import { CORRELATION_HEADER_NAME } from '../../../src/middleware/correlation.id.middleware';

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

  beforeEach(() => {
    balanceSheetJson = {
      type: BalanceSheetType.Full,
      version: BalanceSheetVersion.v5_0_4,
      companyFacts: EmptyCompanyFacts,
    };
  });

  it('deletes balance sheet by id', async () => {
    const testApp = supertest(app);
    balanceSheetJson.companyFacts.industrySectors = [
      {
        industryCode: 'A',
        amountOfTotalTurnover: 0.8,
        description: 'My description',
      },
    ];
    balanceSheetJson.companyFacts.supplyFractions = [
      { countryCode: 'DEU', industryCode: 'A', costs: 300 },
    ];
    balanceSheetJson.companyFacts.employeesFractions = [
      { countryCode: 'DEU', percentage: 0.8 },
    ];
    const postResponse = await testApp
      .post(endpointPath)
      .set(tokenHeader.key, tokenHeader.value)
      .send(balanceSheetJson);

    const response = await testApp
      .delete(`${endpointPath}/${postResponse.body.id}`)
      .set(tokenHeader.key, tokenHeader.value)
      .send();
    expect(response.status).toEqual(200);

    const responseGet = await testApp
      .get(`${endpointPath}/${postResponse.body.id}`)
      .set(tokenHeader.key, tokenHeader.value)
      .send();
    expect(responseGet.status).toEqual(404);

    // Test if all relations marked with cascade true are deleted as well
    const expectZeroCount = 0;
    // Rating
    expect(
      await connection
        .getRepository(Rating)
        .count({ id: postResponse.body.rating.id })
    ).toBe(expectZeroCount);
    // Topics
    expect(
      await connection
        .getRepository(Topic)
        .count({ rating: postResponse.body.rating })
    ).toBe(expectZeroCount);
    // Aspects
    for (const topic of postResponse.body.rating.topics) {
      expect(
        await connection.getRepository(Aspect).count({ topic: topic })
      ).toBe(expectZeroCount);
    }

    // Company Facts
    expect(
      await connection
        .getRepository(CompanyFacts)
        .count({ id: postResponse.body.companyFacts.id })
    ).toBe(expectZeroCount);
    // Industry Sectors
    expect(
      await connection.getRepository(IndustrySector).count({
        companyFacts: postResponse.body.companyFacts,
      })
    ).toBe(expectZeroCount);
    // Supply Fractions
    expect(
      await connection.getRepository(SupplyFraction).count({
        companyFacts: postResponse.body.companyFacts,
      })
    ).toBe(expectZeroCount);
    // EmployeesFractions
    expect(
      await connection.getRepository(EmployeesFraction).count({
        companyFacts: postResponse.body.companyFacts,
      })
    ).toBe(expectZeroCount);
  });

  describe('block access to balance sheet ', () => {
    let tokenOfUnauthorizedUser: string;
    beforeAll(async () => {
      tokenOfUnauthorizedUser = `Bearer ${await TokenProvider.provideValidUserToken(
        app,
        connection,
        'unauthorizedUser@example.com'
      )}`;
    });

    const postAndDeleteWithDifferentUsers = async (): Promise<any> => {
      const testApp = supertest(app);
      const postResponse = await testApp
        .post(endpointPath)
        .set(tokenHeader.key, tokenHeader.value)
        .send(balanceSheetJson);

      return await testApp
        .delete(`${endpointPath}/${postResponse.body.id}`)
        .set(tokenHeader.key, tokenOfUnauthorizedUser)
        .send();
    };

    it('when delete endpoint is called', async () => {
      const response = await postAndDeleteWithDifferentUsers();
      expect(response.status).toEqual(403);
    });
  });

  it('returns given correlation id on delete request', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .delete(`${endpointPath}/9999999`)
      .set(tokenHeader.key, tokenHeader.value)
      .set(CORRELATION_HEADER_NAME, 'my-own-corr-id')
      .send();
    expect(response.status).toEqual(404);
    expect(response.headers[CORRELATION_HEADER_NAME]).toBe('my-own-corr-id');
  });

  it('creates correlation id on delete request', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .delete(`${endpointPath}/9999999`)
      .set(tokenHeader.key, tokenHeader.value)
      .send();
    expect(response.status).toEqual(404);
    expect(response.headers[CORRELATION_HEADER_NAME]).toBeDefined();
  });
});
