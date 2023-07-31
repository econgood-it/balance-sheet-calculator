import supertest from 'supertest';
import { DataSource, Repository } from 'typeorm';
import { DatabaseSourceCreator } from '../../../src/databaseSourceCreator';
import App from '../../../src/app';
import { Application } from 'express';
import { ConfigurationReader } from '../../../src/reader/configuration.reader';
import { Auth, AuthBuilder } from '../../AuthBuilder';
import { BalanceSheetEntity } from '../../../src/entities/balance.sheet.entity';
import { CORRELATION_HEADER_NAME } from '../../../src/middleware/correlation.id.middleware';
import { INDUSTRY_CODE_FOR_FINANCIAL_SERVICES } from '../../../src/models/company.facts';
import {
  balanceSheetJsonFactory,
  companyFactsFactory,
  companyFactsJsonFactory,
} from '../../../src/openapi/examples';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '@ecogood/e-calculator-schemas/dist/shared.schemas';
import { Rating, RatingResponseBody } from '../../../src/models/rating';
import { RepoProvider } from '../../../src/repositories/repo.provider';
import { RatingsFactory } from '../../../src/factories/ratings.factory';

describe('Balance Sheet Controller', () => {
  let dataSource: DataSource;
  let balaneSheetRepository: Repository<BalanceSheetEntity>;
  let app: Application;
  const configuration = ConfigurationReader.read();
  let balanceSheetJson: any;
  const endpointPath = '/v1/balancesheets';
  let auth: Auth;
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
    dataSource = await DatabaseSourceCreator.createDataSourceAndRunMigrations(
      configuration
    );
    balaneSheetRepository = dataSource.getRepository(BalanceSheetEntity);
    app = new App(dataSource, configuration, new RepoProvider(configuration))
      .app;
    auth = await new AuthBuilder(app, dataSource).build();
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

  it('creates BalanceSheet from company facts', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .post(endpointPath)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send(balanceSheetJson);
    expect(response.status).toEqual(200);
    expect(response.body.companyFacts).toMatchObject(
      companyFactsJsonFactory.emptyResponse()
    );
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

  it('creates BalanceSheet of type compact', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .post(endpointPath)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send(balanceSheetJsonFactory.minimalCompactV506());
    expect(response.status).toEqual(200);
    const expectedType = balanceSheetJsonFactory.minimalCompactV506().type;
    const expectedVersion =
      balanceSheetJsonFactory.minimalCompactV506().version;
    const expectedRatings = RatingsFactory.createDefaultRatings(
      expectedType,
      expectedVersion
    );
    const balanceSheetEntity = new BalanceSheetEntity(
      response.body.id,
      {
        type: expectedType,
        version: expectedVersion,
        companyFacts: companyFactsFactory.emptyWithoutOptionalValues(),
        ratings: expectedRatings,
        stakeholderWeights: [],
      },
      []
    );
    expect(response.body).toMatchObject(balanceSheetEntity.toJson('en'));
  });

  it('creates BalanceSheet from company facts without saving results', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .post(endpointPath)
      .set(auth.authHeader.key, auth.authHeader.value)
      .query({ save: 'false' })
      .send(balanceSheetJson);
    expect(response.status).toEqual(200);
    expect(response.body.companyFacts).toMatchObject(
      companyFactsJsonFactory.emptyResponse()
    );
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
      .set(auth.authHeader.key, auth.authHeader.value)
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
      .set(auth.authHeader.key, auth.authHeader.value)
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
      .set(auth.authHeader.key, auth.authHeader.value)
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
      .set(auth.authHeader.key, auth.authHeader.value)
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
      .set(auth.authHeader.key, auth.authHeader.value)
      .send({
        type: BalanceSheetType.Full,
        version: BalanceSheetVersion.v5_0_8,
        companyFacts,
      });
    expect(response.status).toEqual(200);
  }

  it('creates correlation id on post request', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .post(endpointPath)
      .set(auth.authHeader.key, auth.authHeader.value)
      .send(balanceSheetJson);
    expect(response.status).toEqual(200);
    expect(response.headers[CORRELATION_HEADER_NAME]).toBeDefined();
  });

  it('returns given correlation id on post request', async () => {
    const testApp = supertest(app);
    const response = await testApp
      .post(endpointPath)
      .set(auth.authHeader.key, auth.authHeader.value)
      .set(CORRELATION_HEADER_NAME, 'my-own-corr-id')
      .send(balanceSheetJson);

    expect(response.status).toEqual(200);
    expect(response.headers[CORRELATION_HEADER_NAME]).toBe('my-own-corr-id');
  });
});
