import supertest from 'supertest';
import { Connection, Repository } from 'typeorm';
import { DatabaseConnectionCreator } from '../../../src/database.connection.creator';
import App from '../../../src/app';
import { Application } from 'express';
import { ConfigurationReader } from '../../../src/configuration.reader';
import {
  BalanceSheetType,
  BalanceSheetVersion,
} from '../../../src/entities/enums';
import { Assertions } from '../../Assertions';
import { Topic } from '../../../src/entities/topic';
import { FinanceCalc } from '../../../src/calculations/finance.calc';
import { Rating } from '../../../src/entities/rating';
import { CompanyFacts } from '../../../src/entities/companyFacts';
import { EmptyCompanyFactsJson } from '../../testData/company.facts';
import { TokenProvider } from '../../TokenProvider';
import { BalanceSheet } from '../../../src/entities/balanceSheet';

describe('Balance Sheet Controller', () => {
  let connection: Connection;
  let balaneSheetRepository: Repository<BalanceSheet>;
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
    rating: Rating
  ) => {
    const topic: Topic | undefined = rating.topics.find(
      (t: Topic) => t.shortName === shortName
    );
    expect(topic).toBeDefined();
    expect((topic as Topic).weight).toBe(expectedWeight);
  };

  beforeAll(async (done) => {
    connection =
      await DatabaseConnectionCreator.createConnectionAndRunMigrations(
        configuration
      );
    balaneSheetRepository = connection.getRepository(BalanceSheet);
    app = new App(connection, configuration).app;
    tokenHeader.value = `Bearer ${await TokenProvider.provideValidUserToken(
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
      companyFacts: EmptyCompanyFactsJson,
    };
  });

  it('creates BalanceSheet from company facts', async (done) => {
    const testApp = supertest(app);
    const response = await testApp
      .post(endpointPath)
      .set(tokenHeader.key, tokenHeader.value)
      .send(balanceSheetJson);
    expect(response.status).toEqual(200);
    const companyFacts = balanceSheetJson.companyFacts as CompanyFacts;
    Assertions.rmIdFieldsOfCompanyFacts(companyFacts);
    expect(response.body.companyFacts).toMatchObject(companyFacts);
    expect(
      response.body.rating.topics.reduce(
        (sum: number, current: Topic) => sum + current.maxPoints,
        0
      )
    ).toBeCloseTo(999.9999999999998);
    const foundBalanceSheet = await balaneSheetRepository.findOne({
      id: response.body.id,
    });
    expect(foundBalanceSheet).toBeDefined();
    done();
  });

  it('creates BalanceSheet from company facts without saving results', async (done) => {
    const testApp = supertest(app);
    const response = await testApp
      .post(endpointPath)
      .set(tokenHeader.key, tokenHeader.value)
      .query({ save: 'false' })
      .send(balanceSheetJson);
    expect(response.status).toEqual(200);
    const companyFacts = balanceSheetJson.companyFacts as CompanyFacts;
    Assertions.rmIdFieldsOfCompanyFacts(companyFacts);
    expect(response.body.companyFacts).toMatchObject(companyFacts);
    expect(
      response.body.rating.topics.reduce(
        (sum: number, current: Topic) => sum + current.maxPoints,
        0
      )
    ).toBeCloseTo(999.9999999999998);
    // Save flag is false such that balance sheet should not be saved
    const foundBalanceSheet = await balaneSheetRepository.findOne({
      id: response.body.id,
    });
    expect(foundBalanceSheet).toBeUndefined();
    done();
  });

  it('creates BalanceSheet where B1 weight is very high', async (done) => {
    const testApp = supertest(app);
    balanceSheetJson.companyFacts.industrySectors = [
      {
        industryCode: FinanceCalc.INDUSTRY_CODE_FOR_FINANCIAL_SERVICES,
        amountOfTotalTurnover: 1,
        description: 'desc',
      },
    ];
    const response = await testApp
      .post(endpointPath)
      .set(tokenHeader.key, tokenHeader.value)
      .send(balanceSheetJson);
    expect(response.status).toEqual(200);
    assertTopicWeight('B1', 2, response.body.rating as Rating);
    done();
  });

  it('creates BalanceSheet where B2 weight is high', async (done) => {
    const testApp = supertest(app);
    balanceSheetJson.companyFacts.financialCosts = 0.12;
    const response = await testApp
      .post(endpointPath)
      .set(tokenHeader.key, tokenHeader.value)
      .send(balanceSheetJson);
    expect(response.status).toEqual(200);
    assertTopicWeight('B2', 1.5, response.body.rating as Rating);
    done();
  });

  it('creates BalanceSheet where B4 weight is 0.5', async (done) => {
    const testApp = supertest(app);
    balanceSheetJson.companyFacts.numberOfEmployees = 9;
    const response = await testApp
      .post(endpointPath)
      .set(tokenHeader.key, tokenHeader.value)
      .send(balanceSheetJson);
    expect(response.status).toEqual(200);
    assertTopicWeight('B4', 0.5, response.body.rating as Rating);
    done();
  });

  it('creates BalanceSheet where B4 weight is 1', async (done) => {
    const testApp = supertest(app);
    balanceSheetJson.companyFacts.numberOfEmployees = 10;
    const response = await testApp
      .post(endpointPath)
      .set(tokenHeader.key, tokenHeader.value)
      .send(balanceSheetJson);
    expect(response.status).toEqual(200);
    assertTopicWeight('B4', 1, response.body.rating as Rating);
    done();
  });

  it('fails on missing properties in company facts', async (done) => {
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
    await testMissingProperty(
      companyFacts,
      testApp,
      'totalPurchaseFromSuppliers'
    );
    const companyFacts2 = {
      totalPurchaseFromSuppliers: 300,
      totalStaffCosts: 100,
      profit: 3020,
      incomeFromFinancialInvestments: 201,
      additionsToFixedAssets: 2019,
      supplyFractions: [],
      employeesFractions: [],
    };
    await testMissingProperty(companyFacts2, testApp, 'financialCosts');
    done();
  });
  async function testMissingProperty(
    companyFacts: any,
    testApp: supertest.SuperTest<supertest.Test>,
    missingProperty: string
  ): Promise<void> {
    const response = await testApp
      .post(endpointPath)
      .set(tokenHeader.key, tokenHeader.value)
      .send({
        type: BalanceSheetType.Compact,
        version: BalanceSheetVersion.v5_0_4,
        companyFacts,
      });
    const message = 'missing property ';
    expect(response.status).toEqual(400);
    expect(response.text).toMatch(message + missingProperty);
  }
});
