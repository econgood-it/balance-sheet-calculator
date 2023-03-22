import supertest from 'supertest';
import { Connection, Repository } from 'typeorm';
import { DatabaseConnectionCreator } from '../../../src/database.connection.creator';
import App from '../../../src/app';
import { Application } from 'express';
import { ConfigurationReader } from '../../../src/configuration.reader';
import { TokenProvider } from '../../TokenProvider';
import { BalanceSheetEntity } from '../../../src/entities/balance.sheet.entity';
import { CORRELATION_HEADER_NAME } from '../../../src/middleware/correlation.id.middleware';
import { INDUSTRY_CODE_FOR_FINANCIAL_SERVICES } from '../../../src/models/company.facts';
import { companyFactsJsonFactory } from '../../../src/openapi/examples';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from 'e-calculator-schemas/dist/shared.schemas';
import { RatingResponseBody, Rating } from '../../../src/models/rating';

describe('Balance Sheet Controller', () => {
  let connection: Connection;
  let balaneSheetRepository: Repository<BalanceSheetEntity>;
  let app: Application;
  const configuration = ConfigurationReader.read();
  let balanceSheetJson: any;
  const endpointPath = '/v1/balancesheets';
  const tokenHeader = {
    key: 'Authorization',
    value: '',
  };
  const assertTopicWeight = (
    shortName: string,
    expectedWeight: number,
    ratings: RatingResponseBody[]
  ) => {
    const topic = ratings.find(
      (t: RatingResponseBody) => t.shortName === shortName
    );
    expect(topic).toBeDefined();
    expect(topic && topic.weight).toBe(expectedWeight);
  };

  beforeAll(async () => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        configuration
      );
    balaneSheetRepository = connection.getRepository(BalanceSheetEntity);
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
      companyFacts: companyFactsJsonFactory.empty(),
    };
  });

  it('creates BalanceSheet from company facts', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .post(endpointPath)
      .set(tokenHeader.key, tokenHeader.value)
      .send(balanceSheetJson);
    expect(response.status).toEqual(200);
    const companyFacts = balanceSheetJson.companyFacts;
    expect(response.body.companyFacts).toMatchObject(companyFacts);
    expect(
      response.body.ratings
        .filter((r: RatingResponseBody) => r.shortName.length === 2)
        .reduce((sum: number, current: Rating) => sum + current.maxPoints, 0)
    ).toBeCloseTo(999.9999999999998);
    const foundBalanceSheet = await balaneSheetRepository.findOne({
      where: {
        id: response.body.id,
      },
    });
    expect(foundBalanceSheet).toBeDefined();
  });

  it('creates BalanceSheet from company facts without saving results', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .post(endpointPath)
      .set(tokenHeader.key, tokenHeader.value)
      .query({ save: 'false' })
      .send(balanceSheetJson);
    expect(response.status).toEqual(200);
    const companyFacts = balanceSheetJson.companyFacts;
    expect(response.body.companyFacts).toMatchObject(companyFacts);
    expect(
      response.body.ratings
        .filter((r: RatingResponseBody) => r.shortName.length === 2)
        .reduce((sum: number, current: Rating) => sum + current.maxPoints, 0)
    ).toBeCloseTo(999.9999999999998);
    // Save flag is false such that balance sheet should not be saved
    expect(
      (await balaneSheetRepository.find()).filter(
        (b) => b.id === response.body.id
      )
    ).toHaveLength(0);
  });

  it('creates BalanceSheet where B1 weight is very high', async () => {
    const testApp = supertest(app);
    const json = {
      ...balanceSheetJson,
      companyFacts: {
        ...balanceSheetJson.companyFacts,
        industrySectors: [
          {
            industryCode: INDUSTRY_CODE_FOR_FINANCIAL_SERVICES,
            amountOfTotalTurnover: 1,
            description: 'desc',
          },
        ],
      },
    };
    const response = await testApp
      .post(endpointPath)
      .set(tokenHeader.key, tokenHeader.value)
      .send(json);
    expect(response.status).toEqual(200);
    assertTopicWeight('B1', 2, response.body.ratings);
  });

  it('creates BalanceSheet where B2 weight is high', async () => {
    const testApp = supertest(app);
    const json = {
      ...balanceSheetJson,
      companyFacts: {
        ...balanceSheetJson.companyFacts,
        profit: 12,
        turnover: 100,
      },
    };
    const response = await testApp
      .post(endpointPath)
      .set(tokenHeader.key, tokenHeader.value)
      .send(json);
    expect(response.status).toEqual(200);
    assertTopicWeight('B2', 1.5, response.body.ratings);
  });

  it('creates BalanceSheet where B4 weight is 0.5', async () => {
    const testApp = supertest(app);
    const json = {
      ...balanceSheetJson,
      companyFacts: {
        ...balanceSheetJson.companyFacts,
        numberOfEmployees: 9,
      },
    };

    const response = await testApp
      .post(endpointPath)
      .set(tokenHeader.key, tokenHeader.value)
      .send(json);
    expect(response.status).toEqual(200);
    assertTopicWeight('B4', 0.5, response.body.ratings);
  });

  it('creates BalanceSheet where B4 weight is 1', async () => {
    const testApp = supertest(app);
    const json = {
      ...balanceSheetJson,
      companyFacts: {
        ...balanceSheetJson.companyFacts,
        numberOfEmployees: 10,
      },
    };
    const response = await testApp
      .post(endpointPath)
      .set(tokenHeader.key, tokenHeader.value)
      .send(json);
    expect(response.status).toEqual(200);
    assertTopicWeight('B4', 1, response.body.ratings);
  });

  it('success on missing properties in company facts', async () => {
    const testApp = supertest(app);

    const companyFacts = {
      totalStaffCosts: 100,
      profit: 3020,
      financialCosts: 19,
      incomeFromFinancialInvestments: 201,
      additionsToFixedAssets: 2019,
      supplyFractions: [],
      employeesFractions: [],
    };
    await testMissingProperty(companyFacts, testApp);
    const companyFacts2 = {
      totalPurchaseFromSuppliers: 300,
      totalStaffCosts: 100,
      profit: 3020,
      incomeFromFinancialInvestments: 201,
      additionsToFixedAssets: 2019,
      supplyFractions: [],
      employeesFractions: [],
    };
    await testMissingProperty(companyFacts2, testApp);
  });
  async function testMissingProperty(
    companyFacts: any,
    testApp: supertest.SuperTest<supertest.Test>
  ): Promise<void> {
    const response = await testApp
      .post(endpointPath)
      .set(tokenHeader.key, tokenHeader.value)
      .send({
        type: BalanceSheetType.Compact,
        version: BalanceSheetVersion.v5_0_4,
        companyFacts,
      });
    expect(response.status).toEqual(200);
  }

  it('creates correlation id on post request', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .post(endpointPath)
      .set(tokenHeader.key, tokenHeader.value)
      .send(balanceSheetJson);
    expect(response.status).toEqual(200);
    expect(response.headers[CORRELATION_HEADER_NAME]).toBeDefined();
  });

  it('returns given correlation id on post request', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .post(endpointPath)
      .set(tokenHeader.key, tokenHeader.value)
      .set(CORRELATION_HEADER_NAME, 'my-own-corr-id')
      .send(balanceSheetJson);

    expect(response.status).toEqual(200);
    expect(response.headers[CORRELATION_HEADER_NAME]).toBe('my-own-corr-id');
  });
});
